import { Agent } from 'crewai';
import { TavilyAPI } from '../tools/tavilyApi.js';

export class CompanyResearcher extends Agent {
  constructor() {
    super({
      name: 'Company Researcher',
      goal: 'Gather comprehensive information about target companies',
      backstory: 'Expert at corporate research and market analysis',
      tools: [new TavilyAPI()],
      verbose: true
    });
  }

  async analyze(companyData) {
    const research = await this.tools.tavilyApi.analyzeCompany(companyData.name);
    
    return {
      companyInfo: await this.extractCompanyInfo(research),
      techStack: await this.analyzeTechStack(research),
      securityNeeds: await this.identifySecurityNeeds(research)
    };
  }

  async extractCompanyInfo(research) {
    const relevantResults = research.results.slice(0, 5);
    return {
      summary: relevantResults.map(r => r.content).join('\n'),
      sources: relevantResults.map(r => r.url)
    };
  }

  async analyzeTechStack(research) {
    const techKeywords = [
      'authentication', 'authorization', 'login', 'SSO',
      'security', 'identity', 'API', 'cloud', 'platform'
    ];

    return research.results
      .filter(r => techKeywords.some(keyword => 
        r.content.toLowerCase().includes(keyword.toLowerCase())
      ))
      .map(r => ({
        technology: r.content,
        source: r.url
      }));
  }

  async identifySecurityNeeds(research) {
    const securityKeywords = [
      'breach', 'hack', 'security incident', 'authentication',
      'compliance', 'GDPR', 'HIPAA', 'SOC 2'
    ];

    return research.results
      .filter(r => securityKeywords.some(keyword => 
        r.content.toLowerCase().includes(keyword.toLowerCase())
      ))
      .map(r => ({
        concern: r.content,
        source: r.url
      }));
  }
}