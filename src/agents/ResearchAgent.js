import { OpenAIService } from '../services/openai.js';
import { SerperService } from '../services/serper.js';

export class ResearchAgent {
  constructor() {
    this.serper = new SerperService();
    this.openai = new OpenAIService();
  }

  async analyze(companyName) {
    try {
      // Get data from Serper
      const serperData = await this.serper.analyzeCompany(companyName);
      
      // Process and structure the data
      const processedData = this.processResearchData(companyName, serperData);
      
      // Add Auth0 specific research
      const auth0Updates = await this.getAuth0Updates();
      processedData.auth0Updates = auth0Updates;
      
      return processedData;
    } catch (error) {
      console.error('Research Agent Error:', error.message);
      throw error;
    }
  }

  processResearchData(companyName, serperData) {
    return {
      companyInfo: {
        name: companyName,
        summary: this.extractSummary(serperData),
        website: this.extractWebsite(serperData)
      },
      techStack: this.extractTechStack(serperData),
      recentNews: this.extractNews(serperData),
      securityNeeds: this.extractSecurityNeeds(serperData),
      israeliContext: this.extractIsraeliContext(serperData)
    };
  }

  extractSummary(data) {
    const results = data?.results || [];
    const relevantResult = results.find(r => 
      r?.content?.toLowerCase().includes('about') || 
      r?.content?.toLowerCase().includes('company')
    );
    return relevantResult?.content || `${this.companyName} is an Israeli technology company`;
  }

  extractWebsite(data) {
    const results = data?.results || [];
    const websiteResult = results.find(r => 
      r?.link?.includes(r?.title?.toLowerCase().replace(/\s+/g, ''))
    );
    return websiteResult?.link || '';
  }

  extractTechStack(data) {
    const results = data?.results || [];
    const techKeywords = [
      'authentication', 'authorization', 'login', 'SSO',
      'security', 'identity', 'API', 'cloud', 'platform'
    ];

    return results
      .filter(r => r?.content && techKeywords.some(keyword => 
        r.content.toLowerCase().includes(keyword.toLowerCase())
      ))
      .map(r => ({
        technology: r.content || '',
        source: r.link || ''
      }));
  }

  extractNews(data) {
    const results = data?.results || [];
    return results
      .filter(r => r?.content && this.isRecentNews(r.content))
      .map(r => ({
        title: r.title || '',
        content: r.content || '',
        source: r.link || ''
      }));
  }

  extractSecurityNeeds(data) {
    const results = data?.results || [];
    const securityKeywords = [
      'security', 'authentication', 'privacy', 'compliance',
      'protection', 'breach', 'hack', 'vulnerability'
    ];

    return results
      .filter(r => r?.content && securityKeywords.some(keyword => 
        r.content.toLowerCase().includes(keyword.toLowerCase())
      ))
      .map(r => ({
        concern: r.content || '',
        source: r.link || '',
        priority: this.assessPriority(r.content)
      }));
  }

  extractIsraeliContext(data) {
    const results = data?.results || [];
    return {
      marketPosition: this.extractMarketInfo(results),
      techEcosystem: this.extractEcosystemInfo(results),
      regulatoryContext: this.extractRegulationInfo(results)
    };
  }

  isRecentNews(content) {
    if (!content) return false;
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    return content.includes(currentYear.toString()) || 
           content.includes(lastYear.toString());
  }

  assessPriority(content) {
    if (!content) return 'medium';
    const highPriorityTerms = ['urgent', 'critical', 'immediate', 'breach'];
    return highPriorityTerms.some(term => 
      content.toLowerCase().includes(term)
    ) ? 'high' : 'medium';
  }

  extractMarketInfo(results) {
    const marketResults = results
      .filter(r => r?.content?.toLowerCase().includes('market') || 
                  r?.content?.toLowerCase().includes('industry'))
      .map(r => r.content || '');
    return marketResults.join(' ') || 'Israeli tech market';
  }

  extractEcosystemInfo(results) {
    const ecosystemResults = results
      .filter(r => r?.content?.toLowerCase().includes('israel') || 
                  r?.content?.toLowerCase().includes('startup'))
      .map(r => r.content || '');
    return ecosystemResults.join(' ') || 'Part of the Israeli tech ecosystem';
  }

  extractRegulationInfo(results) {
    const regulationResults = results
      .filter(r => r?.content?.toLowerCase().includes('regulation') || 
                  r?.content?.toLowerCase().includes('compliance'))
      .map(r => r.content || '');
    return regulationResults.join(' ') || 'Subject to Israeli tech regulations';
  }

  async getAuth0Updates() {
    const prompt = `Provide latest Auth0 updates focusing on:
1. Recent feature launches
2. Security enhancements
3. Compliance certifications
4. Integration capabilities
5. Israeli market success stories
6. AI/ML specific solutions
7. Enterprise customer wins
8. Performance metrics and ROI examples

Format as JSON with categorized updates.`;

    return await this.openai.generateJSON(prompt);
  }
} 