import { openaiService } from '../services/openai.js';

export class OutreachAgent {
  async createCampaign(research, solution) {
    try {
      console.log('Research data:', JSON.stringify(research, null, 2));
      console.log('Solution data:', JSON.stringify(solution, null, 2));

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

  async generateSubject(research, solution) {
    if (!research?.companyInfo?.name) {
      throw new Error('Company name is missing from research data');
    }

    const prompt = `Create a compelling email subject line for ${research.companyInfo.name} 
                   focusing on Auth0 security solutions. 
                   Context: ${research.companyInfo.summary || 'Israeli tech company'}`;

    const completion = await openaiService.generateJSON(prompt);
    return completion.subject;
  }

  async generateBody(research, solution) {
    if (!research?.companyInfo?.name) {
      throw new Error('Company information is missing from research data');
    }

    const prompt = `Create a highly personalized sales email for ${research.companyInfo.name}, 
an Israeli company. Use the following context:
${JSON.stringify({ research, solution }, null, 2)}`;

    const completion = await openaiService.generateJSON(prompt);
    return completion.body;
  }

  async createCallToAction(solution) {
    const prompt = `Create a compelling call to action for implementing Auth0 
                   security solutions for an Israeli tech company.
                   Format as JSON with a 'callToAction' field.`;

    const completion = await openaiService.generateJSON(prompt);
    return completion.callToAction;
  }

  async createFollowUpStrategy(research) {
    if (!research?.companyInfo?.name) {
      throw new Error('Company name is missing from research data');
    }

    const prompt = `Create a follow-up strategy for ${research.companyInfo.name}, an Israeli company.
Include:
1. Timing for follow-ups
2. Multiple touch points
3. Specific value propositions for each contact
4. Integration with their development cycle
5. References to their tech ecosystem
6. Personalized approach based on company culture

Format as JSON with a 'strategy' field.`;

    const completion = await openaiService.generateJSON(prompt);
    return completion.strategy;
  }
}