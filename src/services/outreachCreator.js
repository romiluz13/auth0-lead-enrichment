import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function createOutreach(companyAnalysis, auth0Solution) {
  const subject = await generateSubject(companyAnalysis, auth0Solution);
  const body = await generateBody(companyAnalysis, auth0Solution);
  const cta = await createCallToAction(auth0Solution);
  const hebrewSummary = await createHebrewSummary(companyAnalysis, auth0Solution);

  return {
    subject,
    body,
    callToAction: cta,
    hebrewSummary,
    followUpStrategy: await createFollowUpStrategy(companyAnalysis)
  };
}

async function generateSubject(analysis, solution) {
  const prompt = `Create a compelling email subject line for ${analysis.companyInfo.name} 
                 focusing on Auth0 ${solution.recommendedProducts[0]?.name}. 
                 Context: ${analysis.companyInfo.summary}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

async function generateBody(analysis, solution) {
  const prompt = `Create a highly personalized sales email for ${analysis.companyInfo.name}, 
an Israeli company. Use the following context:

Recent News & Developments:
${JSON.stringify(analysis.recentNews, null, 2)}

Local Market Context:
${JSON.stringify(analysis.israeliContext, null, 2)}

Tech Stack & Security Needs:
${JSON.stringify(analysis.techStack, null, 2)}

Auth0 Solution:
${JSON.stringify(solution.recommendedProducts, null, 2)}

Requirements:
1. Reference specific recent news or developments
2. Acknowledge their position in the Israeli tech ecosystem
3. Address local market challenges
4. Include relevant local compliance requirements
5. Mention similar Israeli companies' success with Auth0 (if applicable)
6. Keep cultural context in mind
7. Include both strategic and technical benefits
8. Make it personal and show deep research

Tone: Professional but personal, acknowledging local business culture`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

async function createCallToAction(solution) {
  const prompt = `Create a compelling call to action for implementing Auth0 
                 ${solution.recommendedProducts.map(p => p.name).join(', ')}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

async function createHebrewSummary(analysis, solution) {
  const prompt = `Create a brief summary in Hebrew of the key points for ${analysis.companyInfo.name}.
Include:
1. Main value proposition
2. Key benefits
3. Next steps

Make it culturally appropriate for Israeli business context.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

async function createFollowUpStrategy(analysis) {
  const prompt = `Create a follow-up strategy for ${analysis.companyInfo.name}, an Israeli company.
Include:
1. Next steps
2. Cultural considerations
3. Local business practices
4. Mention similar Israeli companies' success with Auth0 (if applicable)
5. Keep cultural context in mind
6. Include both strategic and technical benefits
7. Make it personal and show deep research

Tone: Professional but personal, acknowledging local business culture`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}