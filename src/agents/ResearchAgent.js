import { aiService } from '../services/ai.service.js';
import { auth0Knowledge } from '../data/auth0_features.js';
import { auth0Solutions } from '../data/auth0_solutions.js';
import { ResearchService } from '../services/research.service.js';
import { cisoVariables } from '../data/ciso_variables.js';

export class ResearchAgent {
    constructor() {
        this.researchService = new ResearchService();
    }

    async researchLead(lead) {
        try {
            console.log(`\nResearching ${lead.companyName} using Serper API...`);
            
            // Add delay between requests to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const research = await this.researchService.searchCompany(lead.companyName);
            
            if (!research || (!research.news?.length && !research.info?.length)) {
                console.log('No research results found, using AI generation...');
                return this.generateWithAI(lead);
            }

            // Detect industry and get relevant features
            const industry = this.detectIndustry(lead, research);
            const industryContext = auth0Knowledge.industry_solutions[industry] || auth0Knowledge.industry_solutions.technology;

            // Find best Auth0 solution
            const solution = await this.findBestSolution(lead, research, industry);

            // Get industry-specific variables
            const industryVars = this.getIndustryVariables(industry);

            // Generate variables with AI using real research
            const prompt = `
            Generate security-focused variables for Auth0 CISO outreach using this research:

            Company: ${lead.companyName}
            Role: ${lead.occupation}
            Industry: ${industry}

            Company Research:
            ${JSON.stringify(research, null, 2)}

            Auth0 Solution:
            ${JSON.stringify(solution, null, 2)}

            Industry Variables:
            ${JSON.stringify(industryVars, null, 2)}

            Generate these variables as JSON:
            {
                "security_priorities": "Key security focus area from research (max 60 chars)",
                "security_initiative": "Current/planned security project from research (max 60 chars)",
                "compliance_needs": "Regulatory requirements from industry (max 60 chars)",
                "risk_focus": "Key risk area being addressed (max 60 chars)"
            }

            Requirements:
            1. Use real research data
            2. Focus on security and compliance
            3. Match Auth0 features to security needs
            4. Keep it technical and specific
            5. Use industry-appropriate terminology
            `;

            // Add delay between AI requests
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const result = await aiService.generateJSON(prompt);
            
            // Validate and clean the result
            const cleanResult = {
                email: lead.email,
                firstName: lead.firstName,
                lastName: lead.lastName,
                companyName: lead.companyName,
                industry: industry,
                auth0_solution: solution.name,
                security_priorities: result.security_priorities?.toLowerCase()?.slice(0, 60) || 
                    this.getRandomVariable(industryVars.security_priorities),
                security_initiative: result.security_initiative?.toLowerCase()?.slice(0, 60) || 
                    this.getRandomVariable(industryVars.security_initiative),
                compliance_needs: result.compliance_needs?.toLowerCase()?.slice(0, 60) || 
                    this.getRandomVariable(industryVars.compliance_needs),
                risk_focus: result.risk_focus?.toLowerCase()?.slice(0, 60) || 
                    this.getRandomVariable(industryVars.risk_focus)
            };

            return cleanResult;

        } catch (error) {
            console.log(`Error in research, falling back to AI generation: ${error.message}`);
            return this.generateWithAI(lead);
        }
    }

    async findBestSolution(lead, research, industry) {
        const prompt = `
        Analyze this company and determine the best Auth0 solution:

        Company: ${lead.companyName}
        Industry: ${industry}
        Role: ${lead.occupation}
        Research: ${JSON.stringify(research, null, 2)}

        Available Solutions:
        ${JSON.stringify(auth0Solutions.industry_solutions[industry], null, 2)}

        Feature Solutions:
        ${JSON.stringify(auth0Solutions.feature_solutions, null, 2)}

        Return ONLY the name of the single best matching solution.
        `;

        try {
            const result = await aiService.generateText(prompt);
            const solutionName = result.trim();

            // Find the solution in our knowledge base
            const industrySolutions = auth0Solutions.industry_solutions[industry]?.solutions || [];
            let solution = industrySolutions.find(s => s.name === solutionName);

            if (!solution) {
                // Check feature solutions
                Object.values(auth0Solutions.feature_solutions).forEach(s => {
                    if (s.name === solutionName) {
                        solution = s;
                    }
                });
            }

            // Fallback to first industry solution if no match
            if (!solution && industrySolutions.length > 0) {
                solution = industrySolutions[0];
            }

            // Ultimate fallback
            return solution || auth0Solutions.feature_solutions.developer_tools;

        } catch (error) {
            console.log('Error finding solution, using fallback:', error.message);
            return auth0Solutions.industry_solutions[industry]?.solutions[0] || 
                   auth0Solutions.feature_solutions.developer_tools;
        }
    }

    extractFirstName(lead) {
        // Try to get first name from email
        if (lead.email) {
            const emailName = lead.email.split('@')[0];
            // Handle common email formats
            if (emailName.includes('.')) {
                return emailName.split('.')[0].toLowerCase();
            }
            if (emailName.includes('_')) {
                return emailName.split('_')[0].toLowerCase();
            }
            if (emailName.includes('-')) {
                return emailName.split('-')[0].toLowerCase();
            }
            // Remove any numbers
            return emailName.replace(/[0-9]/g, '').toLowerCase();
        }
        return 'there'; // Fallback
    }

    detectIndustry(lead, research) {
        // Combine company name, research, and domain for better detection
        const text = `
            ${lead.companyName}
            ${research?.info?.map(i => i.description).join(' ')}
            ${research?.news?.map(n => n.snippet).join(' ')}
            ${lead.tech_context || ''}
            ${lead.security_challenge || ''}
            ${lead.dev_benefit || ''}
            ${lead.occupation || ''}
            ${lead.companyDomain || ''}
        `.toLowerCase();

        // Check for strong industry indicators first
        if (text.includes('security') || text.includes('cyber') || text.includes('api security') || 
            text.includes('zero trust') || text.includes('attack') || text.includes('threat')) {
            return 'cybersecurity';
        }

        if (text.includes('health') || text.includes('medical') || text.includes('patient') || 
            text.includes('healthcare') || text.includes('hospital')) {
            return 'healthcare';
        }

        if (text.includes('fintech') || text.includes('payment') || text.includes('banking') || 
            text.includes('finance') || text.includes('transaction')) {
            return 'fintech';
        }

        if (text.includes('retail') || text.includes('ecommerce') || text.includes('shop') || 
            text.includes('store') || text.includes('commerce')) {
            return 'ecommerce';
        }

        // Use Auth0's industry categories
        const industries = Object.keys(auth0Knowledge.industry_solutions);
        
        for (const industry of industries) {
            const keywords = this.getIndustryKeywords(industry);
            if (keywords.some(k => text.includes(k))) {
                return industry;
            }
        }

        return 'technology';
    }

    getIndustryKeywords(industry) {
        const keywordMap = {
            healthcare: ['health', 'medical', 'pharma', 'hospital', 'patient', 'hipaa', 'healthcare'],
            fintech: ['fintech', 'payment', 'banking', 'finance', 'transaction', 'psd2', 'financial'],
            ecommerce: ['ecommerce', 'retail', 'shop', 'store', 'marketplace', 'cart', 'commerce'],
            cybersecurity: ['security', 'cyber', 'threat', 'risk', 'protection', 'zero trust', 'breach', 'attack'],
            technology: ['tech', 'software', 'saas', 'cloud', 'platform', 'api', 'developer']
        };
        return keywordMap[industry] || keywordMap.technology;
    }

    getIndustryVariables(industry) {
        return {
            security_priorities: cisoVariables.security_priorities[industry] || cisoVariables.security_priorities.technology,
            security_initiative: cisoVariables.security_initiative[industry] || cisoVariables.security_initiative.technology,
            compliance_needs: cisoVariables.compliance_needs[industry] || cisoVariables.compliance_needs.technology,
            risk_focus: cisoVariables.risk_focus[industry] || cisoVariables.risk_focus.technology
        };
    }

    getRandomVariable(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    async generateWithAI(lead) {
        const industry = this.detectIndustry(lead, null);
        const industryContext = auth0Knowledge.industry_solutions[industry];
        const solution = await this.findBestSolution(lead, null, industry);

        const prompt = `
        Generate security-focused variables for Auth0 CISO outreach to a technical leader:

        Company: ${lead.companyName}
        Role: ${lead.occupation}
        Industry: ${industry}

        Auth0 Solution:
        ${JSON.stringify(solution, null, 2)}

        Industry Context:
        ${JSON.stringify(industryContext, null, 2)}

        Generate these variables as JSON:
        {
            "security_priorities": "Key security focus area from industry (max 60 chars)",
            "security_initiative": "Current/planned security project from industry (max 60 chars)",
            "compliance_needs": "Regulatory requirements from industry (max 60 chars)",
            "risk_focus": "Key risk area being addressed (max 60 chars)"
        }

        Requirements:
        1. Be specific to company/role
        2. Focus on security and compliance
        3. Match Auth0 features to security needs
        4. Keep it technical and specific
        5. Use industry-appropriate terminology
        `;

        try {
            const result = await aiService.generateJSON(prompt);
            
            // Validate and clean the result
            const cleanResult = {
                email: lead.email,
                firstName: lead.firstName,
                lastName: lead.lastName,
                companyName: lead.companyName,
                industry: industry,
                auth0_solution: solution.name,
                security_priorities: result.security_priorities?.toLowerCase()?.slice(0, 60) || 
                    this.getRandomVariable(cisoVariables.security_priorities[industry] || cisoVariables.security_priorities.technology),
                security_initiative: result.security_initiative?.toLowerCase()?.slice(0, 60) || 
                    this.getRandomVariable(cisoVariables.security_initiative[industry] || cisoVariables.security_initiative.technology),
                compliance_needs: result.compliance_needs?.toLowerCase()?.slice(0, 60) || 
                    this.getRandomVariable(cisoVariables.compliance_needs[industry] || cisoVariables.compliance_needs.technology),
                risk_focus: result.risk_focus?.toLowerCase()?.slice(0, 60) || 
                    this.getRandomVariable(cisoVariables.risk_focus[industry] || cisoVariables.risk_focus.technology)
            };

            return cleanResult;

        } catch (error) {
            console.log(`Using fallback variables for ${lead.companyName}`);
            
            // Use solution-specific fallback
            return {
                email: lead.email,
                firstName: lead.firstName,
                lastName: lead.lastName,
                companyName: lead.companyName,
                industry: industry,
                auth0_solution: solution.name,
                security_priorities: this.getRandomVariable(cisoVariables.security_priorities[industry] || cisoVariables.security_priorities.technology),
                security_initiative: this.getRandomVariable(cisoVariables.security_initiative[industry] || cisoVariables.security_initiative.technology),
                compliance_needs: this.getRandomVariable(cisoVariables.compliance_needs[industry] || cisoVariables.compliance_needs.technology),
                risk_focus: this.getRandomVariable(cisoVariables.risk_focus[industry] || cisoVariables.risk_focus.technology)
            };
        }
    }
}
