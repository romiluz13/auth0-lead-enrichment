import fetch from 'node-fetch';

export class ResearchService {
    constructor() {
        this.apiKey = process.env.SERPER_API_KEY;
        this.baseUrl = 'https://google.serper.dev/search';
    }

    async searchCompany(companyName) {
        try {
            // Search for recent news and announcements
            const newsResults = await this.search(companyName, 'news');
            
            // Search for company information
            const companyResults = await this.search(companyName, 'search');

            return {
                news: this.processNewsResults(newsResults, companyName),
                info: this.processCompanyResults(companyResults, companyName)
            };
        } catch (error) {
            console.error('Error researching company:', error);
            return null;
        }
    }

    async search(query, type = 'search') {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'X-API-KEY': this.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: type === 'news' 
                    ? `"${query}" company (announcement OR launch OR funding OR growth) -site:linkedin.com -site:crunchbase.com`
                    : `"${query}" (company OR startup) (security OR technology) -site:linkedin.com -site:crunchbase.com`,
                type: type,
                num: 10
            })
        });

        if (!response.ok) {
            throw new Error(`Serper API error: ${response.statusText}`);
        }

        return await response.json();
    }

    processNewsResults(results, companyName) {
        if (!results || !results.news) return [];

        return results.news
            .filter(item => {
                // Only include results that mention the company name
                const text = `${item.title} ${item.snippet}`.toLowerCase();
                return text.includes(companyName.toLowerCase()) &&
                       // Exclude job postings and irrelevant content
                       !text.includes('hiring') &&
                       !text.includes('job') &&
                       !text.includes('career') &&
                       !text.includes('vacancy');
            })
            .map(item => ({
                title: item.title,
                snippet: item.snippet,
                date: item.date,
                link: item.link
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    processCompanyResults(results, companyName) {
        if (!results || !results.organic) return [];

        return results.organic
            .filter(item => {
                const text = `${item.title} ${item.snippet}`.toLowerCase();
                return text.includes(companyName.toLowerCase()) &&
                       // Exclude job sites and social media
                       !text.includes('linkedin') &&
                       !text.includes('glassdoor') &&
                       !text.includes('indeed') &&
                       !text.includes('twitter');
            })
            .map(item => ({
                title: item.title,
                description: item.snippet,
                link: item.link
            }));
    }

    extractAchievements(newsResults) {
        if (!newsResults || newsResults.length === 0) return [];

        const achievements = [];
        const keywords = {
            funding: /funding|raised|investment|million|billion/i,
            launch: /launch|released|announced|introduced|unveil/i,
            growth: /growth|expand|growing|scale|scaling/i,
            partnership: /partner|collaboration|alliance/i,
            award: /award|recognition|honored|selected/i
        };

        for (const news of newsResults) {
            const text = `${news.title} ${news.snippet}`.toLowerCase();
            
            for (const [type, pattern] of Object.entries(keywords)) {
                if (pattern.test(text)) {
                    achievements.push({
                        type,
                        title: news.title,
                        date: news.date,
                        text: news.snippet
                    });
                    break;
                }
            }
        }

        return achievements;
    }

    generateAchievementText(achievements, companyName) {
        if (!achievements || achievements.length === 0) {
            return null;
        }

        // Sort by date and get most recent
        const recent = achievements[0];

        switch (recent.type) {
            case 'funding':
                return this.extractFundingAchievement(recent.text, companyName);
            case 'launch':
                return this.extractLaunchAchievement(recent.text, companyName);
            case 'growth':
                return this.extractGrowthAchievement(recent.text, companyName);
            case 'partnership':
                return this.extractPartnershipAchievement(recent.text, companyName);
            case 'award':
                return this.extractAwardAchievement(recent.text, companyName);
            default:
                return null;
        }
    }

    extractFundingAchievement(text, companyName) {
        const amountMatch = text.match(/(\$\d+(?:\.\d+)?(?:\s*(?:million|billion|M|B))?)/i);
        if (amountMatch) {
            return `securing ${amountMatch[1]} in funding to accelerate ${companyName}'s growth`;
        }
        return `securing new funding to accelerate ${companyName}'s growth`;
    }

    extractLaunchAchievement(text, companyName) {
        const productMatch = text.match(/(?:launch|release|announce|introduce|unveil)\s+(?:of\s+)?(?:new\s+)?([^,.]+)/i);
        if (productMatch) {
            return `launching ${companyName}'s ${productMatch[1].trim()}`;
        }
        return `launching ${companyName}'s new security platform`;
    }

    extractGrowthAchievement(text, companyName) {
        const growthMatch = text.match(/(\d+%|double|triple|[^\s]+fold)\s+(?:growth|increase|expansion)/i);
        if (growthMatch) {
            return `achieving ${growthMatch[1]} growth in ${companyName}'s market presence`;
        }
        return `expanding ${companyName}'s global presence`;
    }

    extractPartnershipAchievement(text, companyName) {
        const partnerMatch = text.match(/partnership\s+(?:with\s+)?([^,.]+)/i);
        if (partnerMatch) {
            return `establishing a strategic partnership with ${partnerMatch[1].trim()}`;
        }
        return `securing strategic partnerships for ${companyName}`;
    }

    extractAwardAchievement(text, companyName) {
        const awardMatch = text.match(/(?:receive|win|earn|award[ed]*)\s+(?:the\s+)?([^,.]+)/i);
        if (awardMatch) {
            return `receiving recognition for ${awardMatch[1].trim()}`;
        }
        return `receiving industry recognition for ${companyName}'s innovation`;
    }
}
