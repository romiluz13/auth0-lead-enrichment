export class ValidationService {
  validateResearch(research) {
    if (!research || typeof research !== 'object') return false;
    
    const required = [
      'companyInfo',
      'recentNews',
      'techStack',
      'securityNeeds',
      'marketContext',
      'israeliContext'
    ];

    const hasAllFields = required.every(field => field in research);
    const hasValidCompanyInfo = research.companyInfo?.name && research.companyInfo?.summary;
    
    return hasAllFields && hasValidCompanyInfo;
  }

  validateSolution(solution) {
    if (!solution || typeof solution !== 'object') return false;
    
    const required = [
      'recommendedProducts',
      'valueProposition',
      'implementationStrategy',
      'israeliMarketStrategy',
      'complianceConsiderations'
    ];

    return required.every(field => {
      const value = solution[field];
      return value && (
        Array.isArray(value) ? value.length > 0 : typeof value === 'string'
      );
    });
  }

  validateOutreach(outreach) {
    if (!outreach || typeof outreach !== 'object') return false;
    
    const required = [
      'subject',
      'body',
      'callToAction',
      'hebrewSummary',
      'followUpStrategy'
    ];

    return required.every(field => {
      const value = outreach[field];
      return value && typeof value === 'string' && value.length > 0;
    });
  }
} 