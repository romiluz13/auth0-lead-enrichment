# Auth0 Sales Outreach Generator

An AI-powered system for generating personalized, consultative Auth0 outreach messages based on LinkedIn Sales Navigator data.

## Features

- Deep understanding of Auth0's capabilities and value propositions
- Industry-specific personalization (AI/ML, FinTech, SaaS)
- Role-based messaging (Technical, Security, Business)
- Consultative, helpful tone (not salesy)
- Quality scoring and validation
- Easy copy/paste output format

## Getting Started

1. Export your leads from LinkedIn Sales Navigator
2. Convert the data to JSON format (see example-leads.json)
3. Run the generator:
```bash
node src/index.js
```
4. Find your generated messages in the `outreach-messages` directory

## Data Format

Your leads should be in JSON format like this:
```json
{
  "leads": [
    {
      "company": "Company Name",
      "website": "company.com",
      "description": "Company description...",
      "industry": "Industry type",
      "size": "51-200 employees",
      "market": "B2B/Enterprise",
      "type": "Company type",
      "funding": "Series A/B/etc",
      "location": {
        "hq": "Location",
        "offices": ["Office 1", "Office 2"]
      },
      "contactPerson": {
        "name": "Contact Name",
        "title": "Job Title",
        "email": "email@company.com",
        "department": "Department"
      }
    }
  ]
}
```

See `example-leads.json` for a complete example.

## Output

For each lead, the system generates:
- Personalized subject line
- Consultative message body
- Follow-up strategy
- Quality metrics

Messages are saved as individual text files for easy copy/paste, with a summary report in `_summary.txt`.

## Message Style

The system generates consultative, helpful messages that:
- Open with relevant industry insights
- Share valuable perspectives
- Address specific challenges
- End with thought-provoking insights
- Avoid explicit sales language or CTAs

## Quality Scoring

Each message is scored based on:
- Industry relevance
- Role-specific personalization
- Technical accuracy
- Value proposition clarity
- Overall personalization

Messages scoring below 0.7 are automatically improved.

## Best Practices

1. Provide detailed company descriptions
2. Include accurate job titles
3. Specify industry and company type
4. Include funding/growth information if available
5. List all office locations

## Example Output

```
Subject: AI Security Architecture Insights for Your ML Platform

Hi Sarah,

Your recent work at AI Innovation Labs in scaling enterprise AI deployment caught my attention. Many ML platforms are facing interesting challenges around model access control and data governance, particularly with the new AI regulations being discussed in the EU.

From our experience working with AI companies, we've found that building security into the ML pipeline from the ground up significantly reduces deployment friction. For instance, one AI platform reduced their security review cycles by 80% by implementing automated identity controls across their model deployment process.

The intersection of AI and identity is evolving rapidly, especially around fine-grained API access control and automated compliance monitoring. I've been researching some novel approaches to securing ML model endpoints that might be relevant to your architecture.

I'd be interested in your thoughts on how you're approaching these challenges, particularly around automated security controls for AI systems.

Best regards,
[Your name]
```

## Support

For questions or issues:
1. Check example-leads.json for data format
2. Ensure complete company and contact information
3. Review the generated _summary.txt for quality scores
4. Check individual message files for specific outputs

## License

MIT License
