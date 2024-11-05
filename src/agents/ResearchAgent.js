import { aiService } from '../services/ai.service.js';
import { SerperService } from '../services/serper.js';
import { RateLimiter } from '../utils/rateLimiter.js';
import { validateCompanyName, validateLead } from '../utils/validation.js';

export class ResearchAgent {
    constructor() {
        this.ai = aiService;
        this.serper = new SerperService();
        this.rateLimiter = new RateLimiter();
    }

    async analyze(lead) {
        try {
            // Validate the lead data
            validateLead(lead);
            const companyName = validateCompanyName(lead.company);

            await this.rateLimiter.limit();

            // Get web research data
            const webData = await this.serper.analyzeCompany(companyName);

            // Analyze tech stack and security needs
            const techAnalysis = await this.analyzeTechStack(lead, webData);
            const securityAnalysis = await this.analyzeSecurityNeeds(lead, webData);

            // Combine lead data with web research
            return {
                companyInfo: {
                    name: companyName,
                    website: lead.website,
                    description: lead.description,
                    industry: lead.industry,
                    size: lead.size,
                    funding: lead.funding || '',
                    location: lead.location || {},
                    type: lead.type,
                    market: lead.market,
                    growth: this.determineGrowthStage(lead)
                },
                contactInfo: {
                    name: lead.contactPerson.name,
                    title: lead.contactPerson.title,
                    email: lead.contactPerson.email,
                    department: lead.contactPerson.department,
                    decisionMaker: this.assessDecisionMakerLevel(lead.contactPerson.title)
                },
                techStack: techAnalysis.technologies || [],
                securityNeeds: securityAnalysis.requirements || [],
                recentNews: webData.recentNews || [],
                marketContext: {
                    competitors: webData.competitors || [],
                    trends: webData.trends || [],
                    challenges: webData.challenges || []
                },
                securityContext: {
                    riskLevel: securityAnalysis.riskLevel || 'Medium',
                    complianceRequirements: securityAnalysis.compliance || [],
                    securityChallenges: securityAnalysis.challenges || []
                },
                techAnalysis: {
                    complexity: techAnalysis.complexity || 'Medium',
                    integrationPoints: techAnalysis.integrationPoints || [],
                    scalabilityNeeds: techAnalysis.scalabilityNeeds || []
                },
                israeliContext: {
                    localPresence: lead.location?.hq?.includes('Israel') ? 'Headquarters' : 'Office',
                    marketPosition: webData.marketPosition || {},
                    compliance: webData.compliance || []
                }
            };
        } catch (error) {
            console.error('Error analyzing company:', error);
            throw error;
        }
    }

    determineGrowthStage(lead) {
        if (lead.funding?.includes('Series')) {
            if (lead.funding.includes('Series A')) return 'Early Growth';
            if (lead.funding.includes('Series B')) return 'Rapid Growth';
            if (lead.funding.includes('Series C') || lead.funding.includes('Series D')) return 'Scale-up';
            return 'Growth';
        }
        if (lead.size?.includes('1-10')) return 'Startup';
        if (lead.size?.includes('11-50')) return 'Early Stage';
        if (lead.size?.includes('51-200')) return 'Growth';
        if (lead.size?.includes('201-500')) return 'Scale-up';
        return 'Enterprise';
    }

    assessDecisionMakerLevel(title) {
        const titleLower = title.toLowerCase();
        if (titleLower.includes('ceo') || titleLower.includes('cto') || titleLower.includes('chief')) {
            return 'Ultimate';
        }
        if (titleLower.includes('vp') || titleLower.includes('head') || titleLower.includes('director')) {
            return 'High';
        }
        if (titleLower.includes('manager') || titleLower.includes('lead')) {
            return 'Medium';
        }
        return 'Low';
    }

    async analyzeTechStack(lead, webData) {
        const prompt = `Analyze tech stack and integration needs for ${lead.company}

Context:
${JSON.stringify({ lead, webData }, null, 2)}

Analyze:
1. Technology complexity
2. Integration points
3. Scalability needs
4. Authentication challenges

Return a JSON object with:
{
  "technologies": string[],
  "complexity": "Low" | "Medium" | "High",
  "integrationPoints": string[],
  "scalabilityNeeds": string[]
}`;

        return await this.ai.generateJSON(prompt, {
            temperature: 0.7
        });
    }

    async analyzeSecurityNeeds(lead, webData) {
        const prompt = `Analyze security and compliance needs for ${lead.company}

Context:
${JSON.stringify({ lead, webData }, null, 2)}

Analyze:
1. Security risk level
2. Compliance requirements
3. Security challenges
4. Data protection needs

Return a JSON object with:
{
  "riskLevel": "Low" | "Medium" | "High",
  "compliance": string[],
  "challenges": string[],
  "requirements": string[]
}`;

        return await this.ai.generateJSON(prompt, {
            temperature: 0.7
        });
    }
}
