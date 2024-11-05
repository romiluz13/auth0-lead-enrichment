import Anthropic from "@anthropic-ai/sdk";
import dotenv from 'dotenv';

dotenv.config();

class AIService {
  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
    }

    this.client = new Anthropic({
      apiKey
    });

    this.auth0Knowledge = {
      core_features: `
        - Universal Login: Customizable authentication flow with branded UI
        - Single Sign On: Unified access across applications
        - Multi-factor Authentication: Multiple security layers
        - Passwordless: Modern authentication without passwords
        - Social Connections: Login with social providers
      `,
      security_features: `
        - Adaptive MFA: Context-based authentication
        - Attack Protection: Automated security against threats
        - Breached Password Detection: Real-time password security
        - Anomaly Detection: AI-powered threat detection
        - Custom Security Rules: Flexible security policies
      `,
      enterprise_features: `
        - Enterprise Federation: Connect with corporate directories
        - Organizations: B2B customer identity management
        - Custom Domains: Branded authentication experience
        - Private Cloud: Dedicated deployment options
        - Compliance: SOC2, ISO27001, HIPAA, GDPR ready
      `,
      developer_features: `
        - SDKs: Multiple framework support
        - APIs: Comprehensive identity management
        - Quick Starts: Fast implementation guides
        - Identity Labs: Hands-on learning
        - Extensive Documentation: Detailed guides
      `,
      market_differentiators: {
        ai_security: "AI-powered threat detection and anomaly prevention",
        developer_experience: "Industry-leading developer tools and documentation",
        compliance_automation: "Automated compliance reporting and controls",
        integration_ecosystem: "Universal protocol support and extensive integrations",
        scalability: "Global infrastructure with 99.99% uptime guarantee"
      },
      industry_solutions: {
        ai_companies: {
          features: ["Model access control", "API authentication", "Audit logging"],
          benefits: ["Secure AI model access", "Compliance automation", "Scale with confidence"]
        },
        fintech: {
          features: ["Transaction-level MFA", "Fraud detection", "PSD2 compliance"],
          benefits: ["Reduced fraud risk", "Regulatory compliance", "Enhanced security"]
        }
        // Add more industries...
      }
    };
  }

  async generateJSON(prompt, options = {}) {
    try {
      console.log('  ⚡ Generating AI response...');
      
      const systemPrompt = `You are an expert Auth0 sales engineer with deep technical knowledge and sales expertise. Your goal is to create highly personalized and technically accurate outreach.

Key Auth0 Knowledge:
${JSON.stringify(this.auth0Knowledge, null, 2)}

Guidelines:
1. Focus on technical accuracy and solution fit
2. Personalize based on industry, role, and tech stack
3. Emphasize relevant Auth0 features and benefits
4. Include specific technical details when appropriate
5. Maintain professional and sophisticated tone

CRITICAL: Return a concise, valid JSON object only. Keep responses brief and focused.
Do not include lengthy descriptions or explanations.
Limit each text field to 1-2 sentences maximum.`;

      const response = await this.client.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        temperature: options.temperature || 0.7,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `${prompt}\n\nReturn a brief, focused JSON response. Keep all text fields concise.`
          }
        ]
      });

      let content = response.content[0].text;
      
      // Clean up the response
      content = content
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .replace(/\n\s*\n/g, '\n')
        .trim();

      try {
        const parsed = JSON.parse(content);
        return parsed;
      } catch (parseError) {
        // If parsing fails, try to fix common JSON issues
        content = content
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/"\s+"/g, '","')
          .replace(/}[^}]*$/, '}') // Fix truncated JSON
          .trim();
        
        try {
          return JSON.parse(content);
        } catch (retryError) {
          console.error('Failed to parse AI response. Raw content:', content);
          throw new Error('Could not generate valid JSON response. Trying simpler prompt...');
        }
      }
    } catch (error) {
      console.error('AI Service Error:', error.message);
      
      // Retry with simpler prompt if first attempt failed
      if (!options.isRetry) {
        console.log('  ↻ Retrying with simplified prompt...');
        const simplifiedPrompt = `${prompt}\n\nProvide a very brief JSON response with only the most essential information.`;
        return this.generateJSON(simplifiedPrompt, { ...options, isRetry: true });
      }
      
      throw error;
    }
  }

  async generateText(prompt, options = {}) {
    try {
      const systemPrompt = `You are an expert Auth0 sales engineer with deep technical knowledge and sales expertise.

Key Auth0 Knowledge:
${JSON.stringify(this.auth0Knowledge, null, 2)}

Guidelines:
1. Focus on technical accuracy and solution fit
2. Personalize based on industry, role, and tech stack
3. Emphasize relevant Auth0 features and benefits
4. Include specific technical details when appropriate
5. Maintain professional and sophisticated tone

Keep responses brief, focused, and technically accurate.`;

      const response = await this.client.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        temperature: options.temperature || 0.7,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      return response.content[0].text;
    } catch (error) {
      console.error('AI Service Error:', error.message);
      throw error;
    }
  }

  async scrapeAuth0Docs() {
    // This would be implemented to periodically scrape and update Auth0 documentation
    // For now, we're using the static knowledge base above
    console.log('Auth0 documentation scraping not yet implemented');
  }

  async updateKnowledgeBase(newKnowledge) {
    // This would be implemented to update the knowledge base with new information
    // For now, we're using the static knowledge base above
    console.log('Knowledge base update not yet implemented');
  }
}

const aiService = new AIService();
export { aiService, AIService };
