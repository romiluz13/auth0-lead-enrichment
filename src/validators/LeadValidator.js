export class LeadValidator {
    constructor() {
        this.requiredFields = [
            'email',
            'first_name',
            'recent_achievement',
            'leadership_focus',
            'tech_context',
            'industry',
            'security_challenge',
            'dev_benefit',
            'company_name',
            'auth0_solution'
        ];
    }

    validateLead(lead) {
        const issues = [];

        // Check for missing fields
        for (const field of this.requiredFields) {
            if (!lead[field]) {
                issues.push(`Missing ${field}`);
            }
        }

        // Validate field formats
        if (lead.email && !this.isValidEmail(lead.email)) {
            issues.push('Invalid email format');
        }

        if (lead.first_name && !this.isValidName(lead.first_name)) {
            issues.push('Invalid first name format');
        }

        // Check field lengths
        const maxLengths = {
            recent_achievement: 60,
            leadership_focus: 60,
            tech_context: 60,
            security_challenge: 60,
            dev_benefit: 60
        };

        for (const [field, maxLength] of Object.entries(maxLengths)) {
            if (lead[field] && lead[field].length > maxLength) {
                issues.push(`${field} exceeds ${maxLength} characters`);
            }
        }

        return { issues };
    }

    async fixValidationIssues(lead) {
        const cleanLead = { ...lead };

        // Ensure all fields exist
        this.requiredFields.forEach(field => {
            if (!cleanLead[field]) {
                cleanLead[field] = this.getDefaultValue(field, cleanLead);
            }
        });

        // Truncate long fields
        const maxLengths = {
            recent_achievement: 60,
            leadership_focus: 60,
            tech_context: 60,
            security_challenge: 60,
            dev_benefit: 60
        };

        for (const [field, maxLength] of Object.entries(maxLengths)) {
            if (cleanLead[field] && cleanLead[field].length > maxLength) {
                cleanLead[field] = cleanLead[field].slice(0, maxLength);
            }
        }

        return cleanLead;
    }

    getDefaultValue(field, lead) {
        const defaults = {
            recent_achievement: `expanding ${lead.company_name}'s ${lead.industry} platform`,
            leadership_focus: `driving ${lead.industry} innovation`,
            tech_context: 'secure enterprise solutions',
            security_challenge: 'managing secure access at scale',
            dev_benefit: 'reduced development time and enhanced security',
            auth0_solution: "Auth0's Enterprise Platform"
        };

        return defaults[field] || '';
    }

    isValidEmail(email) {
        return email && 
               email.includes('@') && 
               email.includes('.') && 
               email.length > 5;
    }

    isValidName(name) {
        return name && 
               name.length >= 2 && 
               name.length <= 50 && 
               /^[a-zA-Z0-9\s\-_.]+$/.test(name);
    }
}
