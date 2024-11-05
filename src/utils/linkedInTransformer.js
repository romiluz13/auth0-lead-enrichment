import { ErrorHandler } from './errorHandler.js';

export class LinkedInTransformer {
  static transform(rawData) {
    try {
      // First validate the raw data
      this.validateRawData(rawData);

      // Transform to our internal format
      return {
        company: this.transformCompanyData(rawData),
        contactPerson: this.transformContactData(rawData),
        marketContext: this.transformMarketData(rawData),
        priority: this.calculatePriority(rawData)
      };
    } catch (error) {
      throw ErrorHandler.handle(error, { 
        phase: 'data_transformation',
        rawData 
      });
    }
  }

  static validateRawData(data) {
    const requiredFields = [
      'company',
      'website',
      'industry',
      'size',
      'contactPerson'
    ];

    requiredFields.forEach(field => {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    });

    // Validate contact person fields
    const requiredContactFields = ['name', 'title', 'email'];
    requiredContactFields.forEach(field => {
      if (!data.contactPerson[field]) {
        throw new Error(`Missing required contact field: ${field}`);
      }
    });
  }

  static transformCompanyData(raw) {
    return {
      name: raw.company,
      website: this.normalizeWebsite(raw.website),
      description: raw.description || this.generateDefaultDescription(raw),
      techStack: raw.techStack || this.extractTechStack(raw),
      size: this.normalizeCompanySize(raw.size)
    };
  }

  static transformContactData(raw) {
    return {
      name: raw.contactPerson.name,
      title: raw.contactPerson.title,
      email: raw.contactPerson.email.toLowerCase(),
      linkedInUrl: raw.contactPerson.linkedInUrl || null,
      department: this.inferDepartment(raw.contactPerson.title)
    };
  }

  static transformMarketData(raw) {
    return {
      industry: raw.industry,
      subIndustry: raw.subIndustry || null,
      region: raw.market || 'Israel',
      market: this.determineMarketSegment(raw),
      type: raw.type || this.determineCompanyType(raw)
    };
  }

  static normalizeWebsite(url) {
    if (!url) return null;
    url = url.toLowerCase();
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    return url.replace(/\/$/, ''); // Remove trailing slash
  }

  static normalizeCompanySize(size) {
    const sizeRanges = {
      'Startup': 'Startup',
      'Small': 'Small',
      'Medium': 'Medium',
      'Growth': 'Growth',
      'Large': 'Large',
      'Enterprise': 'Enterprise'
    };

    return sizeRanges[size] || size;
  }

  static inferDepartment(title) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('tech') || titleLower.includes('developer')) return 'Engineering';
    if (titleLower.includes('security')) return 'Security';
    if (titleLower.includes('product')) return 'Product';
    if (titleLower.includes('cto') || titleLower.includes('cio')) return 'Technology';
    if (titleLower.includes('ceo') || titleLower.includes('founder')) return 'Executive';
    return 'Other';
  }

  static extractTechStack(raw) {
    const techStack = [];
    
    // Extract from description
    if (raw.description) {
      const techKeywords = [
        'React', 'Angular', 'Vue', 'Node.js', 'Python',
        'Java', 'Kubernetes', 'Docker', 'AWS', 'Azure',
        'GCP', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
        'GraphQL', 'REST', 'Microservices', 'AI', 'ML'
      ];

      techKeywords.forEach(tech => {
        if (raw.description.includes(tech)) {
          techStack.push(tech);
        }
      });
    }

    return [...new Set(techStack)]; // Remove duplicates
  }

  static determineMarketSegment(raw) {
    const size = this.normalizeCompanySize(raw.size);
    
    if (size === 'Enterprise') return 'Enterprise';
    if (size === 'Large') return 'Mid-Market';
    if (size === 'Growth') return 'Growth';
    return 'SMB';
  }

  static determineCompanyType(raw) {
    const types = {
      'software': 'SaaS',
      'information technology': 'Technology',
      'financial services': 'FinTech',
      'healthcare': 'HealthTech',
      'artificial intelligence': 'AI/ML',
      'cybersecurity': 'Security'
    };

    const industry = raw.industry.toLowerCase();
    return types[industry] || raw.type || 'Other';
  }

  static calculatePriority(raw) {
    let score = 0;
    
    // Size-based scoring
    const sizeScores = {
      'Enterprise': 5,
      'Growth': 4,
      'Medium': 3,
      'Small': 2,
      'Startup': 1
    };
    score += sizeScores[this.normalizeCompanySize(raw.size)] || 0;

    // Tech stack scoring
    const techStack = raw.techStack || this.extractTechStack(raw);
    score += Math.min(techStack.length, 5);

    // Convert score to priority
    if (score >= 8) return 'Very High';
    if (score >= 6) return 'High';
    if (score >= 4) return 'Medium';
    if (score >= 2) return 'Low';
    return 'Very Low';
  }

  static generateDefaultDescription(raw) {
    return `${raw.company} is a ${raw.industry} company based in ${raw.market || 'Israel'}.`;
  }
}
