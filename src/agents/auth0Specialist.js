import { OpenAIService } from '../services/openai.js';

export class Auth0Specialist {
  constructor() {
    this.openai = new OpenAIService();
  }

  async analyzeSolution(companyResearch) {
    const prompt = `Analyze ${companyResearch.companyInfo.name}'s needs and recommend Auth0 solutions.

Context:
${JSON.stringify(companyResearch, null, 2)}

Provide detailed recommendations including:
1. Specific Auth0 products with implementation rationale
2. Integration strategy with existing tech stack
3. Security enhancement opportunities
4. Compliance alignment
5. ROI projections
6. Risk mitigation approach
7. Competitive advantages
8. Cultural fit considerations
9. Implementation timeline
10. Success metrics

Format as detailed JSON with clear sections.`;

    return await this.openai.generateJSON(prompt, {
      model: "gpt-4o",
      temperature: 0.7
    });
  }
}