import { openai } from '../services/openai.js';

export class OutreachAgent {
  async createCampaign(research, solution) {
    try {
      const subject = await this.generateSubject(research, solution);
      const body = await this.generateBody(research, solution);
      const cta = await this.createCallToAction(solution);
      const followUpStrategy = await this.createFollowUpStrategy(research);

      return {
        subject,
        body,
        callToAction: cta,
        followUpStrategy
      };
    } catch (error) {
      console.error('Outreach Agent Error:', error.message);
      throw error;
    }
  }

  async generateSubject(analysis, solution) {
    const prompt = `Create a compelling email subject line for ${analysis.companyInfo.name} 
                   focusing on Auth0 ${solution.recommendedProducts[0]?.name}. 
                   Context: ${analysis.companyInfo.summary}`;

    const completion = await openai.generateJSON(prompt, {
      model: "gpt-4-0125-preview"
    });

    return completion.subject;
  }

  async generateBody(analysis, solution) {
    const prompt = `Create a highly personalized sales email for ${analysis.companyInfo.name}, 
an Israeli company. Use the following context:

Recent News & Developments:
${JSON.stringify(analysis.recentNews, null, 2)}

Local Market Context:
${JSON.stringify(analysis.israeliContext, null, 2)}

Tech Stack & Security Needs:
${JSON.stringify(analysis.techStack, null, 2)}

Auth0 Solution:
${JSON.stringify(solution.recommendedProducts, null, 2)}

Requirements:
1. Reference specific recent news or developments
2. Acknowledge their position in the Israeli tech ecosystem
3. Address local market challenges
4. Include relevant local compliance requirements
5. Mention similar Israeli companies' success with Auth0
6. Keep cultural context in mind
7. Include both strategic and technical benefits
8. Make it personal and show deep research
9. Include specific metrics and ROI examples
10. Reference their specific tech stack and integration points

Format the response as JSON with a 'body' field containing the email content.`;

    const completion = await openai.generateJSON(prompt, {
      model: "gpt-4-0125-preview"
    });

    return completion.body;
  }

  async createCallToAction(solution) {
    const prompt = `Create a compelling call to action for implementing Auth0 
                   ${solution.recommendedProducts.map(p => p.name).join(', ')}.
                   Format as JSON with a 'callToAction' field.`;

    const completion = await openai.generateJSON(prompt, {
      model: "gpt-4-0125-preview"
    });

    return completion.callToAction;
  }

  async createFollowUpStrategy(analysis) {
    const prompt = `Create a follow-up strategy for ${analysis.companyInfo.name}, an Israeli company.
Include:
1. Timing for follow-ups
2. Multiple touch points
3. Specific value propositions for each contact
4. Integration with their development cycle
5. References to their tech ecosystem
6. Personalized approach based on company culture

Format as JSON with a 'strategy' field.`;

    const completion = await openai.generateJSON(prompt, {
      model: "gpt-4-0125-preview"
    });

    return completion.strategy;
  }
} 