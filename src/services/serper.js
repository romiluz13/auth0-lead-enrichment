import dotenv from 'dotenv';
dotenv.config();

export class SerperService {
    constructor() {
        if (!process.env.SERPER_API_KEY) {
            throw new Error('SERPER_API_KEY is not set in environment variables');
        }
        this.apiKey = process.env.SERPER_API_KEY;
    }

    async analyzeCompany(companyName) {
        try {
            const response = await fetch('https://google.serper.dev/search', {
                method: 'POST',
                headers: {
                    'X-API-KEY': this.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    q: `${companyName} company information technology stack security`,
                    num: 10
                })
            });

            if (!response.ok) {
                throw new Error(`Serper API error: ${response.statusText}`);
            }

            const data = await response.json();
            return this.processSearchResults(data, companyName);
        } catch (error) {
            console.error('Serper service error:', error);
            throw error;
        }
    }

    processSearchResults(data, companyName) {
        // Process and structure the search results
        return {
            summary: this.extractSummary(data),
            industry: this.extractIndustry(data),
            size: this.extractCompanySize(data),
            technologies: this.extractTechnologies(data),
            securityRequirements: this.extractSecurityInfo(data),
            recentNews: this.extractNews(data),
            localPresence: this.extractLocalPresence(data),
            marketPosition: this.extractMarketPosition(data),
            compliance: this.extractCompliance(data)
        };
    }

    // Helper methods to extract specific information
    extractSummary(data) {
        const organic = data.organic || [];
        return organic[0]?.snippet || '';
    }

    extractIndustry(data) {
        // Implementation for industry extraction
        return '';
    }

    extractCompanySize(data) {
        // Implementation for company size extraction
        return '';
    }

    extractTechnologies(data) {
        // Implementation for tech stack extraction
        return [];
    }

    extractSecurityInfo(data) {
        // Implementation for security requirements extraction
        return [];
    }

    extractNews(data) {
        // Implementation for news extraction
        return [];
    }

    extractLocalPresence(data) {
        // Implementation for local presence extraction
        return {};
    }

    extractMarketPosition(data) {
        // Implementation for market position extraction
        return {};
    }

    extractCompliance(data) {
        // Implementation for compliance extraction
        return [];
    }
}
