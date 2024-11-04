import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class OpenAIService {
  async generateJSON(prompt, options = {}) {
    try {
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
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

Always provide responses in valid JSON format only, no additional text.`
          },
          { 
            role: "user", 
            content: prompt + "\n\nRemember to respond with valid JSON only." 
          }
        ],
        temperature: options.temperature || 0.7
      });

      const content = completion.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI Service Error:', error.message);
      throw error;
    }
  }
}

export const openaiService = new OpenAIService();