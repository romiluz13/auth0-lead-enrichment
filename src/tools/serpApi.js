import { getJson } from 'google-search-results-nodejs';

export class SerpAPI {
  constructor() {
    this.client = new getJson({
      api_key: process.env.SERP_API_KEY
    });
  }

  async search(query) {
    return new Promise((resolve, reject) => {
      this.client.json({
        q: query,
        num: 10
      }, (result) => {
        resolve(result);
      });
    });
  }
}