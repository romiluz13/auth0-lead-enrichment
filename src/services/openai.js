import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class OpenAIService {
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async generateJSON(prompt, options = {}) {
    try {
      console.log('  ⚡ Generating AI response...');
      
      const completion = await this.client.chat.completions.create({
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
            content: prompt + "\n\nRespond with valid JSON only." 
          }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: 2000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', content);
        throw new Error('Invalid JSON response from OpenAI');
      }

    } catch (error) {
      console.error('OpenAI Service Error:', error.message);
      throw error;
    }
  }

  async generateText(prompt, options = {}) {
    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert AI sales agent specializing in Auth0 solutions for the Israeli tech market.`
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: 2000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI Service Error:', error.message);
      throw error;
    }
  }
}

const openaiService = new OpenAIService();
export { openaiService, OpenAIService }; 