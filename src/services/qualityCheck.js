export class QualityCheckService {
  checkPersonalization(outreach, research) {
    const checks = {
      mentionsCompanyName: outreach.body.includes(research.companyInfo.name),
      mentionsTechStack: research.techStack.some(tech => 
        outreach.body.includes(tech.technology)),
      mentionsNews: research.recentNews.some(news => 
        outreach.body.includes(news.title)),
      includesMetrics: /\d+%|\d+ times/.test(outreach.body),
      includesCaseStudies: outreach.body.includes("case study") || 
        outreach.body.includes("success story"),
      hasSpecificROI: /ROI|return on investment|saved|reduced|improved/.test(outreach.body),
      mentionsAuth0Features: outreach.body.includes("Auth0") &&
        outreach.body.includes("authentication"),
      addressesLocalContext: outreach.body.includes("Israel") ||
        outreach.body.includes("Israeli"),
      includesCallToAction: outreach.callToAction && 
        outreach.callToAction.length > 20,
      hasFollowUpStrategy: outreach.followUpStrategy && 
        outreach.followUpStrategy.length > 50
    };

    const score = Object.values(checks).filter(Boolean).length / Object.keys(checks).length;
    
    return {
      score,
      checks,
      suggestions: this.generateSuggestions(checks)
    };
  }

  generateSuggestions(checks) {
    const suggestions = [];
    
    if (!checks.mentionsCompanyName) {
      suggestions.push("Include company name more prominently");
    }
    if (!checks.mentionsTechStack) {
      suggestions.push("Reference their specific technology stack");
    }
    if (!checks.mentionsNews) {
      suggestions.push("Include recent company news or developments");
    }
    if (!checks.includesMetrics) {
      suggestions.push("Add specific metrics or ROI examples");
    }
    if (!checks.includesCaseStudies) {
      suggestions.push("Include relevant case studies or success stories");
    }
    if (!checks.hasSpecificROI) {
      suggestions.push("Add specific ROI or value metrics");
    }
    if (!checks.mentionsAuth0Features) {
      suggestions.push("Highlight specific Auth0 features and benefits");
    }
    if (!checks.addressesLocalContext) {
      suggestions.push("Include more Israeli market context");
    }
    if (!checks.includesCallToAction) {
      suggestions.push("Strengthen the call to action");
    }
    if (!checks.hasFollowUpStrategy) {
      suggestions.push("Develop a more detailed follow-up strategy");
    }

    return suggestions;
  }
} 