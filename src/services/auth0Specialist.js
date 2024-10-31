import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function analyzeSolution(companyResearch) {
  const products = await identifyRelevantProducts(companyResearch);
  const value = await createValueProposition(companyResearch, products);
  const implementation = await suggestImplementation(companyResearch, products);
  const localizedStrategy = await createLocalizedStrategy(companyResearch, products);

  return {
    recommendedProducts: products,
    valueProposition: value,
    implementationStrategy: implementation,
    israeliMarketStrategy: localizedStrategy,
    complianceConsiderations: await analyzeCompliance(companyResearch)
  };
}

async function identifyRelevantProducts(research) {
  const { techStack, securityNeeds } = research;
  const products = [];
  
  if (securityNeeds.some(need => 
    need.concern.toLowerCase().includes('authentication') ||
    need.concern.toLowerCase().includes('login'))) {
    products.push({
      name: 'Universal Authentication',
      reason: 'Centralized authentication needs identified'
    });
  }

  if (techStack.some(tech => 
    tech.technology.toLowerCase().includes('cloud') ||
    tech.technology.toLowerCase().includes('saas'))) {
    products.push({
      name: 'Single Sign-On',
      reason: 'Multiple cloud/SaaS applications in use'
    });
  }

  return products;
}

async function createValueProposition(research, products) {
  const prompt = `Create a value proposition for ${research.companyInfo.name} 
                 focusing on Auth0 ${products.map(p => p.name).join(', ')}. 
                 Context: ${research.companyInfo.summary}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

async function suggestImplementation(research, products) {
  const prompt = `Suggest an implementation strategy for ${research.companyInfo.name} 
                 using Auth0 ${products.map(p => p.name).join(', ')}. 
                 Consider their tech stack: ${JSON.stringify(research.techStack)}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

async function createLocalizedStrategy(research, products) {
  const prompt = `Create a localized strategy for ${research.companyInfo.name}, an Israeli company.
  
Context:
- Recent news: ${JSON.stringify(research.recentNews)}
- Market position: ${JSON.stringify(research.israeliContext.marketPosition)}
- Local tech ecosystem: ${JSON.stringify(research.israeliContext.techEcosystem)}
- Regulatory environment: ${JSON.stringify(research.israeliContext.regulatoryContext)}

Create a detailed strategy that:
1. Addresses specific Israeli market challenges
2. Leverages local tech ecosystem advantages
3. Considers local regulatory requirements
4. Incorporates cultural business practices
5. Suggests local partnerships or integrations

Products to focus on: ${products.map(p => p.name).join(', ')}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4-0125-preview",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

async function analyzeCompliance(research) {
  const prompt = `Analyze the compliance considerations for ${research.companyInfo.name} 
                 based on their tech stack and security needs. 
                 Context: ${research.companyInfo.summary}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}