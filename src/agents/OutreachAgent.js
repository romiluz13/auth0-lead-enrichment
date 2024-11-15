import { aiService } from '../services/ai.service.js';
import { auth0Knowledge } from '../data/auth0_features.js';

export class OutreachAgent {
    async generateSequence(lead) {
        try {
            const prompt = `
            Generate a concise, technical email sequence for Auth0 outreach:

            Lead: ${JSON.stringify(lead, null, 2)}

            Requirements:
            1. Subject line: Focus on auth/security value (max 35 chars)
            2. Body: 3 lines only (greeting, value prop, call to action)
            3. Use these variables: {{first_name}}, {{recent_achievement}}, {{tech_context}}, {{security_challenge}}, {{dev_benefit}}, {{auth0_solution}}
            4. Focus on technical value
            5. Keep it casual but professional (use "Hi" not "Dear")
            6. MUST use {{auth0_solution}} in the value proposition

            Return JSON with:
            {
                "subject": "Subject line (max 35 chars)",
                "body": "Email body (3 lines only)"
            }
            `;

            const result = await aiService.generateJSON(prompt);
            
            if (!result?.subject || !result?.body) {
                console.log('Invalid AI response, using fallback template');
                return this.getFallbackTemplate(lead);
            }

            // Clean and format the message
            const body = result.body
                .replace(/\\n/g, '\n')
                .replace(/\n{3,}/g, '\n\n')
                .replace(/["""]/g, '"')
                .replace(/Dear\s/gi, 'Hi ') // Replace "Dear" with "Hi"
                .replace(/\{\{([^}]+)\}\}/g, (match, p1) => `{{${p1.trim().toLowerCase()}}}`) // Ensure variable names are lowercase
                .trim();

            // Clean subject line
            const subject = result.subject
                .replace(/\{\{([^}]+)\}\}/g, (match, p1) => `{{${p1.trim().toLowerCase()}}}`) // Ensure variable names are lowercase
                .replace(/\{\{[^}]+\}\}$/, '') // Remove incomplete variables at end
                .replace(/\s+/g, ' ') // Normalize spaces
                .trim();

            // Ensure subject line is complete
            const maxLength = 35;
            const truncatedSubject = subject.length > maxLength ? 
                subject.slice(0, subject.lastIndexOf(' ', maxLength)) : 
                subject;

            // Validate that auth0_solution is used
            if (!body.includes('{{auth0_solution}}')) {
                console.log('Missing auth0_solution variable, using fallback template');
                return this.getFallbackTemplate(lead);
            }

            return {
                subject: truncatedSubject,
                body
            };

        } catch (error) {
            console.log('Error generating sequence, using fallback template');
            return this.getFallbackTemplate(lead);
        }
    }

    getFallbackTemplate(lead) {
        const templates = {
            cybersecurity: {
                subject: `Secure ${lead.security_priorities} with Auth0`,
                body: `Hi {{firstName}},\n\nAs you lead {{security_initiative}} at {{companyName}}, I thought you'd be interested in how {{auth0_solution}} helps address {{risk_focus}} while ensuring {{compliance_needs}}.\n\nWould you be open to discussing how we're helping similar organizations strengthen their security posture?`
            },
            healthcare: {
                subject: `HIPAA-ready identity security`,
                body: `Hi {{firstName}},\n\nWith {{compliance_needs}} critical for healthcare, I wanted to share how {{auth0_solution}} helps organizations like {{companyName}} address {{risk_focus}} while maintaining compliance.\n\nCould we discuss your {{security_initiative}} and how Auth0 can help?`
            },
            fintech: {
                subject: `Secure fintech compliance & auth`,
                body: `Hi {{firstName}},\n\nAs you manage {{security_priorities}} at {{companyName}}, I thought you'd be interested in how {{auth0_solution}} helps ensure {{compliance_needs}} while mitigating {{risk_focus}}.\n\nWould you be open to exploring how we can support your security initiatives?`
            },
            technology: {
                subject: `Scale secure auth infrastructure`,
                body: `Hi {{firstName}},\n\nGiven your focus on {{security_initiative}} at {{companyName}}, I wanted to share how {{auth0_solution}} helps tech companies address {{risk_focus}} while maintaining {{compliance_needs}}.\n\nCould we discuss your security roadmap and how Auth0 can help?`
            }
        };

        const template = templates[lead.industry] || templates.cybersecurity;
        return template;
    }
}
