import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export class SerperService {
  constructor() {
    this.apiKey = process.env.SERPER_API_KEY;
    this.baseUrl = 'https://google.serper.dev/search';
  }

  async analyzeCompany(companyName) {
    try {
      const response = await axios.post(this.baseUrl, 
        {
          q: `${companyName} company technology security`,
          num: 10
        },
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        results: response.data.organic.map(result => ({
          title: result.title,
          content: result.snippet,
          url: result.link
        }))
      };
    } catch (error) {
      console.error('Serper API Error:', error.message);
      return null;
    }
  }
}