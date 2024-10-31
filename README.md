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

1. Clone the repository:
```bash
git clone https://github.com/rom
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`

## Usage

Run with company name:
```bash
npm start "Company Name"
```

Run with CSV file:
```bash
npm start "prospects.csv"
```

## System Components

1. **Company Researcher Agent**
   - Gathers company information
   - Analyzes tech stack
   - Identifies security needs

2. **Auth0 Solution Specialist Agent**
   - Matches Auth0 products to company needs
   - Creates value propositions
   - Develops implementation strategies

3. **Outreach Creator Agent**
   - Generates personalized messages
   - Creates compelling subject lines
   - Crafts effective calls to action

## Example Output

```json
{
  "research": {
    "companyInfo": {},
    "techStack": [],
    "securityNeeds": []
  },
  "solution": {
    "recommendedProducts": [],
    "valueProposition": "",
    "implementationStrategy": ""
  },
  "outreach": {
    "subject": "",
    "body": "",
    "callToAction": ""
  }
}
```

## Best Practices

1. Review AI-generated content before sending
2. Regularly update Auth0 product knowledge
3. Monitor and improve response rates
4. Maintain compliance with privacy regulations