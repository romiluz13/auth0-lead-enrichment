import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class OpenAIService {
  async generateJSON(prompt, options = {}) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert AI sales agent specializing in Auth0 solutions for the Israeli tech market. 
You have deep knowledge of:
- Authentication & security best practices
- Israeli tech ecosystem
- Enterprise software sales
- AI/ML company needs
- Compliance requirements (GDPR, SOC2, ISO)
- Cultural business practices in Israel

Always provide detailed, actionable responses formatted as clean JSON.`
          },
          { role: "user", content: prompt }
        ],
        temperature: options.temperature || 0.7,
        response_format: { type: "json_object" }
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI Service Error:', error.message);
      throw error;
    }
  }
}

export { openai };