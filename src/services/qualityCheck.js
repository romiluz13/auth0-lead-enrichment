export class QualityCheckService {
  constructor() {
    this.qualityFactors = {
      personalization: {
        companyContext: {
          weight: 0.2,
          checks: [
            'References company name',
            'Mentions industry context',
            'Includes growth stage',
            'References tech stack',
            'Mentions recent news/developments'
          ]
        },
        roleContext: {
          weight: 0.2,
          checks: [
            'Matches recipient role',
            'Uses appropriate technical depth',
            'Addresses role-specific challenges',
            'Includes relevant metrics',
            'Uses appropriate terminology'
          ]
        },
        solutionFit: {
          weight: 0.3,
          checks: [
            'Addresses specific pain points',
            'Maps features to needs',
            'Provides relevant examples',
            'Shows clear value proposition',
            'Includes industry-specific benefits'
          ]
        },
        technicalAccuracy: {
          weight: 0.3,
          checks: [
            'Correct feature descriptions',
            'Accurate technical terms',
            'Proper integration context',
            'Valid security concepts',
            'Correct compliance details'
          ]
        }
      },
      contentQuality: {
        clarity: {
          weight: 0.2,
          checks: [
            'Clear main message',
            'Structured content',
            'Concise writing',
            'Logical flow',
            'Professional tone'
          ]
        },
        engagement: {
          weight: 0.2,
          checks: [
            'Compelling hook',
            'Relevant insights',
            'Clear value proposition',
            'Effective call to action',
            'Natural conversation flow'
          ]
        },
        technicalDepth: {
          weight: 0.3,
          checks: [
            'Appropriate technical detail',
            'Accurate feature description',
            'Relevant use cases',
            'Clear implementation path',
            'Proper technical context'
          ]
        },
        businessValue: {
          weight: 0.3,
          checks: [
            'Clear ROI potential',
            'Specific benefits',
            'Relevant metrics',
            'Industry context',
            'Competitive advantage'
          ]
        }
      }
    };

    this.industryStandards = {
      ai: {
        mustInclude: [
          'API security',
          'Data protection',
          'Scale handling',
          'Compliance requirements'
        ],
        technicalDepth: 'high',
        focusAreas: ['security', 'scalability', 'compliance']
      },
      fintech: {
        mustInclude: [
          'Financial compliance',
          'Transaction security',
          'Fraud prevention',
          'Data protection'
        ],
        technicalDepth: 'high',
        focusAreas: ['security', 'compliance', 'reliability']
      },
      saas: {
        mustInclude: [
          'Multi-tenancy',
          'User management',
          'Integration capabilities',
          'Scale requirements'
        ],
        technicalDepth: 'medium',
        focusAreas: ['scalability', 'integration', 'management']
      }
    };

    this.roleStandards = {
      technical: {
        depth: 'high',
        focus: ['implementation', 'integration', 'architecture'],
        style: 'technical',
        metrics: ['performance', 'scalability', 'reliability']
      },
      security: {
        depth: 'high',
        focus: ['security', 'compliance', 'risk'],
        style: 'security-focused',
        metrics: ['security', 'compliance', 'risk reduction']
      },
      business: {
        depth: 'medium',
        focus: ['value', 'growth', 'efficiency'],
        style: 'business',
        metrics: ['roi', 'efficiency', 'market position']
      }
    };
  }

  checkPersonalization(outreach, research) {
    const scores = {
      personalization: this.checkPersonalizationFactors(outreach, research),
      contentQuality: this.checkContentQuality(outreach, research)
    };

    const overallScore = (scores.personalization + scores.contentQuality) / 2;
    const suggestions = this.generateSuggestions(scores, outreach, research);

    return {
      score: overallScore,
      details: scores,
      suggestions
    };
  }

  checkPersonalizationFactors(outreach, research) {
    let score = 0;
    const factors = this.qualityFactors.personalization;

    // Company Context
    score += this.checkFactor(factors.companyContext, outreach, research);

    // Role Context
    score += this.checkFactor(factors.roleContext, outreach, research);

    // Solution Fit
    score += this.checkFactor(factors.solutionFit, outreach, research);

    // Technical Accuracy
    score += this.checkFactor(factors.technicalAccuracy, outreach, research);

    return score;
  }

  checkContentQuality(outreach, research) {
    let score = 0;
    const factors = this.qualityFactors.contentQuality;

    // Clarity
    score += this.checkFactor(factors.clarity, outreach, research);

    // Engagement
    score += this.checkFactor(factors.engagement, outreach, research);

    // Technical Depth
    score += this.checkFactor(factors.technicalDepth, outreach, research);

    // Business Value
    score += this.checkFactor(factors.businessValue, outreach, research);

    return score;
  }

  checkFactor(factor, outreach, research) {
    let score = 0;
    const maxScore = factor.weight;

    factor.checks.forEach(check => {
      if (this.meetsCheck(check, outreach, research)) {
        score += maxScore / factor.checks.length;
      }
    });

    return score;
  }

  meetsCheck(check, outreach, research) {
    const content = outreach.body.toLowerCase();
    const subject = outreach.subject.toLowerCase();

    // Company Context Checks
    if (check === 'References company name') {
      return content.includes(research.companyInfo.name.toLowerCase());
    }
    if (check === 'Mentions industry context') {
      return content.includes(research.companyInfo.industry.toLowerCase());
    }
    if (check === 'References tech stack') {
      return research.techStack?.some(tech => 
        content.includes(tech.toLowerCase())
      );
    }

    // Role Context Checks
    if (check === 'Matches recipient role') {
      const role = research.contactInfo.title.toLowerCase();
      const roleStandard = this.getRoleStandard(role);
      return roleStandard.focus.some(focus => 
        content.includes(focus.toLowerCase())
      );
    }

    // Industry-specific Checks
    const industry = research.companyInfo.industry.toLowerCase();
    const industryStandard = this.getIndustryStandard(industry);
    if (industryStandard) {
      return industryStandard.mustInclude.some(item =>
        content.includes(item.toLowerCase())
      );
    }

    // Generic Quality Checks
    if (check === 'Clear main message') {
      return subject.length < 60 && subject.includes('Auth0');
    }
    if (check === 'Effective call to action') {
      return outreach.callToAction && outreach.callToAction.length < 100;
    }

    return true; // Default to true for checks not specifically implemented
  }

  getRoleStandard(role) {
    if (role.includes('cto') || role.includes('architect') || role.includes('developer')) {
      return this.roleStandards.technical;
    }
    if (role.includes('security') || role.includes('ciso')) {
      return this.roleStandards.security;
    }
    return this.roleStandards.business;
  }

  getIndustryStandard(industry) {
    if (industry.includes('ai')) {
      return this.industryStandards.ai;
    }
    if (industry.includes('fintech')) {
      return this.industryStandards.fintech;
    }
    if (industry.includes('saas')) {
      return this.industryStandards.saas;
    }
    return null;
  }

  generateSuggestions(scores, outreach, research) {
    const suggestions = [];
    const threshold = 0.7;

    // Check personalization scores
    Object.entries(scores.personalization).forEach(([factor, score]) => {
      if (score < threshold) {
        suggestions.push(this.getSuggestionForFactor(factor, research));
      }
    });

    // Check content quality
    Object.entries(scores.contentQuality).forEach(([factor, score]) => {
      if (score < threshold) {
        suggestions.push(this.getSuggestionForFactor(factor, research));
      }
    });

    return suggestions;
  }

  getSuggestionForFactor(factor, research) {
    const suggestions = {
      companyContext: `Enhance personalization with more references to ${research.companyInfo.name}'s specific context`,
      roleContext: `Adjust technical depth for ${research.contactInfo.title} role`,
      solutionFit: 'Strengthen connection between Auth0 features and specific needs',
      technicalAccuracy: 'Ensure all technical details are precise and relevant',
      clarity: 'Improve message structure and clarity',
      engagement: 'Enhance hook and value proposition',
      technicalDepth: 'Adjust technical content depth',
      businessValue: 'Strengthen ROI and business impact messaging'
    };

    return suggestions[factor] || 'Review and enhance content quality';
  }
}
