import { ResearchAgent } from '../agents/ResearchAgent.js';
import { Auth0Specialist } from '../agents/auth0Specialist.js';
import { OutreachAgent } from '../agents/OutreachAgent.js';
import { QualityCheckService } from '../services/qualityCheck.js';

export class OutreachCrew {
  constructor(leads) {
    this.leads = leads;
    this.researcher = new ResearchAgent();
    this.specialist = new Auth0Specialist();
    this.outreachAgent = new OutreachAgent();
    this.qualityCheck = new QualityCheckService();

    console.log('OutreachCrew initialized with:', leads.length, 'leads');
  }

  async execute() {
    const results = [];
    console.log('Starting execution for', this.leads.length, 'leads');

    for (const lead of this.leads) {
      console.log(`\nProcessing lead: ${lead.company}`);

      try {
        // Phase 1: Research
        console.log('Starting research phase...');
        const research = await this.researcher.analyze(lead.company);
        console.log('Research completed');

        // Phase 2: Solution Analysis
        console.log('Starting solution analysis...');
        const solution = await this.specialist.analyzeSolution(research);
        console.log('Solution analysis completed');

        // Phase 3: Create Outreach Campaign
        console.log('Creating outreach campaign...');
        const outreach = await this.outreachAgent.createCampaign(research, solution);
        console.log('Outreach campaign created');

        results.push({
          lead,
          research,
          solution,
          outreach
        });
      } catch (error) {
        console.error(`Error processing lead ${lead.company}:`, error);
        results.push({
          lead,
          error: error.message
        });
      }
    }

    return results;
  }
}