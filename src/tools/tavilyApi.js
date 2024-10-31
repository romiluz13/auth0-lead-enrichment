import { TavilySearchAPIClient } from '@tavily/sdk';

export class TavilyAPI {
  constructor() {
    this.client = new TavilySearchAPIClient(process.env.TAVILY_API_KEY);
  }

  async search(query, options = {}) {
    try {
      const searchResult = await this.client.search({
        query,
        searchDepth: options.searchDepth || 'advanced',
        includeDomains: options.domains || [],
        excludeDomains: options.excludeDomains || [],
        maxResults: options.maxResults || 10
      });
      return searchResult;
    } catch (error) {
      console.error('Tavily API Error:', error);
      throw error;
    }
  }

  async analyzeCompany(companyName) {
    const query = `${companyName} company technology stack security authentication`;
    return this.search(query, {
      searchDepth: 'advanced',
      maxResults: 15
    });
  }
}