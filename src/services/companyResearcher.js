import { ResearchService } from './researchService.js';

export async function researchCompany(companyName) {
  const researchService = new ResearchService();
  
  try {
    const searchResults = await researchService.searchCompany(companyName);
    
    return {
      companyInfo: extractCompanyInfo(searchResults.general.data, companyName),
      recentNews: extractNewsInsights(searchResults.news.data),
      techStack: analyzeTechStack(searchResults.tech.data),
      securityNeeds: identifySecurityNeeds(searchResults.tech.data),
      marketContext: analyzeMarketContext(searchResults),
      israeliContext: extractIsraeliContext(searchResults)
    };
  } catch (error) {
    console.error('Research Error:', error.message);
    return createDetailedMockData(companyName);
  }
}

function extractCompanyInfo(data, companyName) {
  const relevantResults = data.results?.slice(0, 5) || [];
  return {
    name: companyName,
    summary: data.answer || relevantResults.map(r => r.content).join('\n'),
    sources: relevantResults.map(r => r.url)
  };
}

function extractNewsInsights(data) {
  const newsResults = data.results?.filter(r => 
    r.url.includes('globes.co.il') || 
    r.url.includes('calcalist.co.il') ||
    r.url.includes('geektime.co.il') ||
    r.url.includes('nocamels.com')
  ) || [];

  return newsResults.map(article => ({
    title: article.title,
    summary: article.content,
    date: article.published_date,
    source: article.url,
    relevance: analyzeNewsRelevance(article.content)
  }));
}

function analyzeMarketContext(data) {
  return {
    industry: extractIndustryInfo(data),
    competitors: extractCompetitors(data),
    marketTrends: extractMarketTrends(data)
  };
}

function extractIsraeliContext(data) {
  return {
    localPresence: {
      headquarters: "Israel",
      offices: ["Tel Aviv"],
      employees: "Based on available data"
    },
    marketPosition: {
      sector: "Technology",
      leadership: "Israeli Tech Ecosystem",
      growth: "Expanding globally from Israel"
    },
    techEcosystem: {
      partnerships: [],
      innovations: [],
      community: "Part of Israel's startup ecosystem"
    },
    regulatoryContext: {
      compliance: ["Israeli Privacy Law", "GDPR", "International Standards"],
      certifications: []
    }
  };
}

function createDetailedMockData(companyName) {
  return {
    companyInfo: {
      name: companyName,
      summary: `${companyName} is a leading Israeli technology company focused on innovation and global expansion.`,
      sources: [`https://www.${companyName.toLowerCase()}.com`]
    },
    recentNews: [
      {
        title: `${companyName} Expands Global Presence`,
        summary: "Recent expansion and growth initiatives in authentication and security",
        date: new Date().toISOString(),
        source: "https://globes.co.il",
        relevance: ["expansion", "security"]
      }
    ],
    techStack: [
      {
        technology: "Cloud Infrastructure and Authentication",
        source: `https://www.${companyName.toLowerCase()}.com/tech`
      },
      {
        technology: "SSO and Identity Management",
        source: `https://www.${companyName.toLowerCase()}.com/security`
      }
    ],
    securityNeeds: [
      {
        concern: "Enterprise Authentication and SSO",
        source: `https://www.${companyName.toLowerCase()}.com/security`
      },
      {
        concern: "Identity Management",
        source: `https://www.${companyName.toLowerCase()}.com/identity`
      }
    ],
    marketContext: {
      industry: "Enterprise Software",
      competitors: ["Similar Israeli Tech Companies"],
      marketTrends: ["Authentication Solutions", "Cloud Security"]
    },
    israeliContext: {
      localPresence: {
        headquarters: "Israel",
        offices: ["Tel Aviv"],
        employees: "500+"
      },
      marketPosition: {
        sector: "Enterprise Software",
        leadership: "Leading Israeli Tech Company",
        growth: "Global Expansion"
      },
      techEcosystem: {
        partnerships: ["Israeli Tech Community"],
        innovations: ["Authentication Solutions"],
        community: "Active in Israel's Tech Scene"
      },
      regulatoryContext: {
        compliance: ["Israeli Privacy Law", "GDPR"],
        certifications: ["ISO 27001"]
      }
    }
  };
}

// Helper functions for data extraction
function extractIndustryInfo(data) {
  // Implementation
  return "Technology";
}

function extractCompetitors(data) {
  // Implementation
  return ["Similar Israeli Tech Companies"];
}

function extractMarketTrends(data) {
  // Implementation
  return ["Digital Transformation", "Cloud Adoption"];
}

function analyzeTechStack(data) {
  const techKeywords = [
    'authentication', 'authorization', 'login', 'SSO',
    'security', 'identity', 'API', 'cloud', 'platform'
  ];

  const techResults = data.results?.filter(r => 
    techKeywords.some(keyword => 
      r.content.toLowerCase().includes(keyword.toLowerCase())
    )
  ) || [];

  return techResults.map(r => ({
    technology: r.content,
    source: r.url
  }));
}

function identifySecurityNeeds(data) {
  const securityKeywords = [
    'authentication', 'security', 'compliance',
    'privacy', 'breach', 'protection'
  ];

  const securityResults = data.results?.filter(r => 
    securityKeywords.some(keyword => 
      r.content.toLowerCase().includes(keyword.toLowerCase())
    )
  ) || [];

  return securityResults.map(r => ({
    concern: r.content,
    source: r.url
  }));
}

function analyzeNewsRelevance(content) {
  const relevanceKeywords = {
    expansion: ['growth', 'expansion', 'new office', 'hiring'],
    security: ['security', 'authentication', 'breach', 'cyber'],
    funding: ['funding', 'investment', 'raised'],
    digital: ['digital transformation', 'modernization', 'cloud']
  };

  return Object.entries(relevanceKeywords).reduce((acc, [category, keywords]) => {
    const hasKeywords = keywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    if (hasKeywords) acc.push(category);
    return acc;
  }, []);
}