import { aiService } from '../services/ai.service.js';
import { ErrorHandler } from '../utils/errorHandler.js';

export class OutreachAgent {
  constructor() {
    this.personalizationFactors = {
      companyContext: {
        recentNews: 0.15,
        growthStage: 0.15,
        techStack: 0.15,
        marketPosition: 0.1
      },
      securityContext: {
        complianceNeeds: 0.15,
        securityChallenges: 0.15,
        dataProtection: 0.15
      },
      contactContext: {
        role: 0.2,
        responsibilities: 0.15,
        technicalBackground: 0.15
      },
      industryContext: {
        trends: 0.1,
        challenges: 0.15,
        regulations: 0.15
      },
      aiContext: {
        modelTypes: 0.15,
        dataPrivacy: 0.15,
        scalingNeeds: 0.15,
        securityRequirements: 0.15
      },
      businessImpact: {
        timeToMarket: 0.15,
        costReduction: 0.15,
        riskMitigation: 0.15,
        competitiveAdvantage: 0.15
      }
    };

    this.messageStyles = {
      technical: {
        cto: {
          focus: ['Technical architecture', 'Implementation approach', 'Developer experience'],
          style: 'Technical depth with practical insights',
          tone: 'Peer-to-peer technical discussion'
        },
        architect: {
          focus: ['System design', 'Integration patterns', 'Security architecture'],
          style: 'Architecture-focused with design principles',
          tone: 'Technical collaboration'
        },
        developer: {
          focus: ['Implementation details', 'SDK usage', 'Developer tools'],
          style: 'Code-centric with practical examples',
          tone: 'Developer-to-developer'
        }
      },
      security: {
        ciso: {
          focus: ['Security architecture', 'Compliance automation', 'Risk management'],
          style: 'Security-first with compliance focus',
          tone: 'Security professional dialogue'
        },
        security_engineer: {
          focus: ['Security implementation', 'Threat prevention', 'Security monitoring'],
          style: 'Technical security with practical focus',
          tone: 'Security engineering perspective'
        }
      },
      business: {
        ceo: {
          focus: ['Innovation enablement', 'Market dynamics', 'Strategic value'],
          style: 'Strategic with industry insights',
          tone: 'Thought leadership'
        },
        product: {
          focus: ['User experience', 'Feature enablement', 'Market needs'],
          style: 'Product-centric with UX focus',
          tone: 'Product innovation dialogue'
        }
      }
    };

    this.industryInsights = {
      ai: {
        trends: ['API security', 'Model access control', 'Data privacy'],
        challenges: ['Secure model access', 'User authentication', 'Compliance'],
        insights: ['Identity in AI systems', 'Authentication for AI APIs', 'Compliance automation']
      },
      fintech: {
        trends: ['Open banking', 'Payment security', 'Regulatory changes'],
        challenges: ['Transaction security', 'Fraud prevention', 'Compliance'],
        insights: ['Financial-grade security', 'Transaction protection', 'Automated compliance']
      },
      saas: {
        trends: ['Zero trust', 'Customer identity', 'B2B growth'],
        challenges: ['User management', 'Multi-tenancy', 'Scale'],
        insights: ['B2B identity platforms', 'Enterprise federation', 'Identity scaling']
      }
    };

    this.auth0Features = {
      security: {
        aiModelAccess: {
          name: '@Auth0 AI Model Access Control',
          benefits: ['Secure model endpoints', 'Rate limiting', 'Usage tracking']
        },
        apiSecurity: {
          name: '@Auth0 API Security',
          benefits: ['Token validation', 'Scope control', 'Attack protection']
        }
      },
      compliance: {
        automatedControls: {
          name: '@Auth0 Compliance Automation',
          benefits: ['SOC2 controls', 'GDPR features']
        }
      }
    };
  }

  determineMessageStyle(research) {
    const role = research.contactInfo.title.toLowerCase();
    const industry = research.companyInfo.industry.toLowerCase();

    // First check role-specific style
    if (role.includes('cto') || role.includes('chief technical')) {
      return this.messageStyles.technical.cto;
    }
    if (role.includes('architect')) {
      return this.messageStyles.technical.architect;
    }
    if (role.includes('developer') || role.includes('engineer')) {
      return this.messageStyles.technical.developer;
    }
    if (role.includes('ciso') || role.includes('security officer')) {
      return this.messageStyles.security.ciso;
    }
    if (role.includes('security')) {
      return this.messageStyles.security.security_engineer;
    }
    if (role.includes('ceo') || role.includes('chief executive')) {
      return this.messageStyles.business.ceo;
    }
    if (role.includes('product')) {
      return this.messageStyles.business.product;
    }

    // Default to business style
    return this.messageStyles.business.ceo;
  }

  determineIndustryType(research) {
    const industry = research.companyInfo.industry.toLowerCase();
    if (industry.includes('ai') || industry.includes('artificial intelligence')) return 'ai';
    if (industry.includes('fintech') || industry.includes('financial')) return 'fintech';
    return 'saas';
  }

  identifyPainPoints(research, solution) {
    const painPoints = [];
    const industry = research.companyInfo.industry.toLowerCase();

    // Industry-specific pain points
    if (industry.includes('ai')) {
      painPoints.push({
        category: 'Security',
        point: 'AI model access control',
        solution: 'Fine-grained API authentication'
      });
      painPoints.push({
        category: 'Compliance',
        point: 'AI data protection regulations',
        solution: 'Automated compliance controls'
      });
    }

    // Growth-related pain points
    if (research.companyInfo.funding?.includes('Series')) {
      painPoints.push({
        category: 'Scale',
        point: 'Authentication scaling challenges',
        solution: 'Enterprise-grade identity platform'
      });
    }

    // Security pain points
    if (research.securityContext?.challenges) {
      research.securityContext.challenges.forEach(challenge => {
        painPoints.push({
          category: 'Security',
          point: challenge,
          solution: this.matchSolutionToChallenge(challenge)
        });
      });
    }

    return painPoints;
  }

  matchSolutionToChallenge(challenge) {
    const solutions = {
      'data protection': 'End-to-end data encryption',
      'compliance': 'Automated compliance controls',
      'scale': 'Global identity infrastructure',
      'security': 'Advanced threat protection',
      'integration': 'Universal identity protocol support'
    };

    for (const [key, solution] of Object.entries(solutions)) {
      if (challenge.toLowerCase().includes(key)) {
        return solution;
      }
    }

    return 'Comprehensive security features';
  }

  createValueProposition(research, solution) {
    const valueProps = [];
    const industry = research.companyInfo.industry.toLowerCase();
    const role = research.contactInfo.title.toLowerCase();

    // Industry-specific value props
    if (industry.includes('ai')) {
      valueProps.push({
        category: 'Security',
        value: 'Secure AI model access',
        impact: 'Protected AI assets'
      });
    }

    // Role-specific value props
    if (role.includes('cto') || role.includes('technical')) {
      valueProps.push({
        category: 'Development',
        value: 'Reduced development time',
        impact: 'Faster time to market'
      });
    }

    if (role.includes('security') || role.includes('ciso')) {
      valueProps.push({
        category: 'Security',
        value: 'Enhanced security posture',
        impact: 'Reduced security risks'
      });
    }

    return valueProps;
  }

  async createCampaign(research, solution) {
    try {
      console.log('Creating personalized campaign for:', research.companyInfo.name);

      const personalizationScore = this.calculatePersonalizationScore(research);
      const messageStyle = this.determineMessageStyle(research);
      
      const subject = await this.generateSubject(research, solution, messageStyle);
      const body = await this.generateBody(research, solution, messageStyle);
      const followUpStrategy = await this.createFollowUpStrategy(research, solution);

      return {
        subject,
        body,
        followUpStrategy,
        metadata: {
          personalizationScore,
          messageStyle,
          targetedPainPoints: this.identifyPainPoints(research, solution),
          valueProposition: this.createValueProposition(research, solution)
        }
      };
    } catch (error) {
      throw ErrorHandler.handle(error, {
        phase: 'outreach_creation',
        company: research.companyInfo.name
      });
    }
  }

  async generateSubject(research, solution, messageStyle) {
    const prompt = `Create an intriguing subject line for ${research.companyInfo.name}.

Context:
Company: ${JSON.stringify(research.companyInfo)}
Style: ${JSON.stringify(messageStyle)}
Solution: ${JSON.stringify(solution)}

Requirements:
1. Focus on ${messageStyle.focus.join(', ')}
2. Use ${messageStyle.tone} tone
3. Keep under 60 characters
4. Create curiosity
5. Highlight specific AI insight
6. NO generic or salesy language

Format: {"subject": "your subject line here"}`;

    const completion = await aiService.generateJSON(prompt, {
      temperature: 0.7
    });

    return completion.subject;
  }

  async generateBody(research, solution, messageStyle) {
    const industryInsights = this.industryInsights[this.determineIndustryType(research)] || {};

    const prompt = `Create a concise, compelling message for ${research.companyInfo.name}.

Context:
Company: ${JSON.stringify(research.companyInfo)}
Contact: ${JSON.stringify(research.contactInfo)}
Style: ${JSON.stringify(messageStyle)}
Industry Insights: ${JSON.stringify(industryInsights)}
Solution: ${JSON.stringify(solution)}

Requirements:
1. Start with a powerful insight about their specific AI implementation
2. Use formatting for emphasis:
   - <b>bold</b> for key points
   - • bullet points for lists
   - --- for subtle section breaks
3. Keep to 2-3 short paragraphs maximum
4. Focus on ${messageStyle.focus.join(', ')}
5. Use ${messageStyle.tone} tone
6. Create curiosity without being salesy
7. End with a thought-provoking insight or question
8. NO calls to action or sales language

Format: {"body": "your message content here"}

Example format:
<b>Key insight about their AI implementation</b>
• Point about their specific challenge
• Point about industry trend
• Point about unique opportunity

Brief paragraph connecting insights to their needs...

Thought-provoking question about the future of their AI implementation?`;

    const completion = await aiService.generateJSON(prompt, {
      temperature: 0.7
    });

    return completion.body;
  }

  async createFollowUpStrategy(research, solution) {
    const followUpPrompt = `Create a sophisticated follow-up strategy for ${research.companyInfo.name}.

Requirements:
1. Three high-value touchpoints
2. Each provides unique technical insight
3. Focus on ${this.determineIndustryType(research)} specific challenges
4. Include relevant Auth0 case studies
5. Highlight compliance and security advantages

Structure each touchpoint with:
- Timing: Optimal follow-up window
- Insight: Technical or industry observation
- Content: Specific resource or whitepaper
- Validation: Technical discussion points
- Next Steps: Clear action items`;

    const completion = await aiService.generateJSON(followUpPrompt, {
      temperature: 0.7
    });

    return completion;
  }

  calculatePersonalizationScore(research) {
    let score = 0;
    let maxScore = 0;

    // Company Context
    for (const [factor, weight] of Object.entries(this.personalizationFactors.companyContext)) {
      maxScore += weight;
      if (research.companyInfo[factor]) score += weight;
    }

    // Security Context
    for (const [factor, weight] of Object.entries(this.personalizationFactors.securityContext)) {
      maxScore += weight;
      if (research.securityContext?.[factor]) score += weight;
    }

    // Contact Context
    for (const [factor, weight] of Object.entries(this.personalizationFactors.contactContext)) {
      maxScore += weight;
      if (research.contactInfo?.[factor]) score += weight;
    }

    // Industry Context
    for (const [factor, weight] of Object.entries(this.personalizationFactors.industryContext)) {
      maxScore += weight;
      if (research.industryContext?.[factor]) score += weight;
    }

    return score / maxScore;
  }
}
