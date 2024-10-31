# Auth0 Sales Outreach System

An AI-powered system for generating personalized B2B outreach for Auth0 solutions, focusing on Israeli tech companies.

## Features

- AI-powered research and analysis
- Personalized outreach generation
- Israeli market context awareness
- Multi-agent architecture
- Quality checking system
- Hebrew summary generation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a .env file with your API keys:
```
OPENAI_API_KEY=your_openai_key_here
SERPER_API_KEY=your_serper_key_here
```

## Usage

There are two ways to use the system:

### 1. Run Test with Sample AI Companies
```bash
npm run test-run
```
This will process three predefined AI companies and save results in test-output/

### 2. Process Custom Companies
Create a companies.txt file with company names (one per line), then:
```bash
npm start
```
Results will be saved in output/

## System Components

1. **Research Agent**
   - Gathers company information via Serper API
   - Analyzes tech stack
   - Identifies security needs
   - Provides Israeli market context

2. **Auth0 Specialist**
   - Analyzes company needs
   - Recommends Auth0 solutions
   - Creates implementation strategies
   - Provides ROI projections

3. **Outreach Agent**
   - Generates personalized emails
   - Creates subject lines
   - Develops follow-up strategies
   - Generates Hebrew summaries

## Example Output Structure
```json
{
  "lead": {
    "company": "Company Name",
    "contactPerson": {
      "name": "Contact Name",
      "title": "Position",
      "email": "email@company.com"
    }
  },
  "research": {
    "companyInfo": {},
    "techStack": [],
    "securityNeeds": [],
    "israeliContext": {},
    "auth0Updates": {}
  },
  "solution": {
    "recommendedProducts": [],
    "valueProposition": "",
    "implementationStrategy": ""
  },
  "outreach": {
    "subject": "",
    "body": "",
    "callToAction": "",
    "followUpStrategy": "",
    "hebrewSummary": ""
  },
  "qualityScore": {
    "score": 0.0,
    "checks": {},
    "suggestions": []
  }
}
```

## Best Practices

1. Review AI-generated content before sending
2. Keep Auth0 product knowledge updated
3. Monitor response rates
4. Maintain privacy compliance