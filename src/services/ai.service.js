import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

class AIService {
    constructor() {
        // Initialize providers
        const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
        if (!anthropicKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable is required');
        }
        this.anthropic = new Anthropic({
            apiKey: anthropicKey
        });

        const openaiKey = process.env.OPENAI_API_KEY?.trim();
        if (openaiKey) {
            this.openai = new OpenAI({
                apiKey: openaiKey
            });
        }

        // Default to Anthropic
        this.currentProvider = 'anthropic';
        this.model = 'claude-3-sonnet-20240229';
        console.log(` Switched to ${this.currentProvider} - ${this.model}`);

        // Model configurations
        this.models = {
            openai: {
                'gpt-4': {
                    name: 'gpt-4',
                    maxTokens: 8192,
                    contextWindow: 8192,
                    temperature: 0.7,
                    description: 'High-intelligence flagship model for complex tasks'
                },
                'gpt-3.5-turbo': {
                    name: 'gpt-3.5-turbo',
                    maxTokens: 4096,
                    temperature: 0.7,
                    description: 'Fast, efficient model for simpler tasks'
                }
            },
            anthropic: {
                'claude-3-opus-20240229': {
                    name: 'claude-3-opus-20240229',
                    maxTokens: 4096,
                    temperature: 0.7,
                    description: 'Most capable Claude model'
                },
                'claude-3-sonnet-20240229': {
                    name: 'claude-3-sonnet-20240229',
                    maxTokens: 4096,
                    temperature: 0.7,
                    description: 'Fast and efficient Claude model'
                },
                'claude-3-haiku': {
                    name: 'claude-3-haiku',
                    maxTokens: 4096,
                    temperature: 0.7,
                    description: 'Fast, efficient Claude model for simple tasks'
                }
            }
        };

        // Default configuration
        this.config = {
            provider: 'anthropic',
            model: 'claude-3-sonnet-20240229',
            temperature: 0.7,
            maxTokens: 4096
        };

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

    setModel(model, provider = null) {
        // If provider is specified, use it
        if (provider) {
            this.config.provider = provider;
        }
        // Otherwise, detect provider from model name
        else if (model.startsWith('gpt')) {
            this.config.provider = 'openai';
        } else if (model.startsWith('claude')) {
            this.config.provider = 'anthropic';
        }

        this.config.model = model;
        console.log(` Switched to ${this.config.provider} - ${model}`);
        return this;
    }

    setTemperature(temp) {
        this.config.temperature = temp;
        return this;
    }

    async generateJSON(prompt) {
        try {
            console.log(` Generating AI response using ${this.config.provider} - ${this.config.model}...`);

            if (this.config.provider === 'anthropic') {
                const response = await this.anthropic.messages.create({
                    model: this.config.model,
                    max_tokens: 1024,
                    temperature: 0.7,
                    messages: [{
                        role: 'user',
                        content: `${prompt}\n\nReturn ONLY valid JSON with 'subject' and 'body' fields. No other text.`
                    }],
                    system: "You are an expert at generating concise, compelling email content. Always return valid JSON with both 'subject' and 'body' fields."
                });

                const content = response.content[0].text;

                try {
                    // Extract JSON from response
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (!jsonMatch) {
                        throw new Error('No JSON found in response');
                    }

                    const result = JSON.parse(jsonMatch[0]);

                    // Ensure both fields exist
                    if (!result.subject || !result.body) {
                        throw new Error('Missing required fields');
                    }

                    return result;

                } catch (parseError) {
                    console.log('Error parsing AI response, using fallback');
                    return {
                        subject: 'Auth0: Streamline your security & auth',
                        body: 'Hi {{first_name}},\n\nSaw your work on {{recent_achievement}} - impressive! Auth0\'s fine-grained authorization could help address {{security_challenge}}.\n\nQuick call to discuss how we help {{industry}} companies like {{company_name}}?\n\nBest,\n[Your name]'
                    };
                }

            } else if (this.config.provider === 'openai') {
                const response = await this.openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    temperature: 0.7,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert at generating concise, compelling email content. Always return valid JSON with both "subject" and "body" fields.'
                        },
                        {
                            role: 'user',
                            content: `${prompt}\n\nReturn ONLY valid JSON with 'subject' and 'body' fields. No other text.`
                        }
                    ],
                    response_format: { type: "json_object" }
                });

                const result = JSON.parse(response.choices[0].message.content);

                // Ensure both fields exist
                if (!result.subject || !result.body) {
                    throw new Error('Missing required fields');
                }

                return result;

            }

            throw new Error('No AI provider available');

        } catch (error) {
            console.log('AI service error:', error.message);
            return {
                subject: 'Auth0: Streamline your security & auth',
                body: 'Hi {{first_name}},\n\nSaw your work on {{recent_achievement}} - impressive! Auth0\'s fine-grained authorization could help address {{security_challenge}}.\n\nQuick call to discuss how we help {{industry}} companies like {{company_name}}?\n\nBest,\n[Your name]'
            };
        }
    }

    async generateText(prompt, options = {}) {
        try {
            const systemPrompt = `You are an expert Auth0 sales engineer helping generate personalized outreach content. Follow these guidelines:

1. Be concise and technically accurate
2. Focus on specific value propositions
3. Avoid marketing language
4. Include specific technical details when appropriate
5. Maintain professional and sophisticated tone

Keep responses brief, focused, and technically accurate.`;

            if (this.config.provider === 'anthropic') {
                const response = await this.anthropic.messages.create({
                    model: this.config.model,
                    max_tokens: this.config.maxTokens,
                    temperature: options.temperature || this.config.temperature,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    system: systemPrompt
                });

                return response.content[0].text;

            } else if (this.config.provider === 'openai') {
                const response = await this.openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    temperature: 0.7,
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                });

                return response.choices[0].message.content;
            }

            throw new Error('No AI provider available');

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

export const aiService = new AIService();
