import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export class TavilyService {
  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY;
    this.baseUrl = 'https://api.tavily.com/v1';
  }

  async analyzeCompany(companyName) {
    try {
      const response = await axios.post(`${this.baseUrl}/search`, {
        api_key: this.apiKey,
        query: `${companyName} company information technology security`,
        search_depth: "advanced",
        max_results: 10
      });

      return response.data;
    } catch (error) {
      console.error('Tavily API Error:', error.message);
      return null;
    }
  }
} 