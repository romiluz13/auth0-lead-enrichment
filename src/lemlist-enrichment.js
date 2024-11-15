import fs from 'fs';
import path from 'path';
import { parse, stringify } from 'csv/sync';
import { aiService } from '../src/services/ai.service.js';
import { ResearchAgent } from './agents/ResearchAgent.js';
import { OutreachAgent } from './agents/OutreachAgent.js';
import { LeadValidator } from './validators/LeadValidator.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class LemlistEnrichment {
    constructor() {
        this.researchAgent = new ResearchAgent();
        this.outreachAgent = new OutreachAgent();
        this.validator = new LeadValidator();
        
        // Use Claude-3-Sonnet for efficient processing
        aiService.setModel('claude-3-sonnet-20240229', 'anthropic');
    }

    async processLeads(inputCsvPath, targetFolder) {
        try {
            console.log('🚀 Starting lead enrichment process...\n');
            
            // Create output directory if it doesn't exist
            if (!fs.existsSync(targetFolder)) {
                fs.mkdirSync(targetFolder, { recursive: true });
            }

            // Read and parse input CSV
            if (!inputCsvPath) {
                throw new Error('Input CSV path is required');
            }
            
            console.log(`Reading leads from: ${inputCsvPath}`);
            const fileContent = fs.readFileSync(inputCsvPath, 'utf-8');
            const leads = parse(fileContent, { 
                columns: true,
                skip_empty_lines: true 
            });
            
            console.log(`📊 Found ${leads.length} leads to process`);
            console.log('Starting research and personalization...\n');

            // Process each lead
            const enrichedLeads = [];
            const processingResults = {
                total: leads.length,
                successful: 0,
                failed: 0,
                errors: []
            };

            for (const lead of leads) {
                try {
                    console.log(`\nProcessing ${lead.email}...`);
                    
                    // Clean lead data
                    const cleanLead = {
                        email: lead.email,
                        firstName: lead.firstName,
                        lastName: lead.lastName,
                        companyName: lead.companyName,
                        companyDomain: lead.companyDomain,
                        occupation: lead.occupation
                    };
                    
                    // Research the lead
                    const enrichedData = await this.researchAgent.researchLead(cleanLead);
                    
                    // Generate sequence
                    const sequence = await this.outreachAgent.generateSequence(enrichedData);
                    
                    enrichedLeads.push({
                        ...enrichedData,
                        subject: sequence.subject,
                        message: sequence.body.replace(/\n/g, '\\n')
                    });
                    
                    console.log('✅ Successfully processed');
                    processingResults.successful++;
                    
                } catch (error) {
                    console.error(`Error processing ${lead.email}:`, error);
                    processingResults.failed++;
                    processingResults.errors.push({
                        email: lead.email,
                        error: error.message
                    });
                }
            }

            // Save results
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const outputPath = path.join(targetFolder, `lemlist_leads_${timestamp}.csv`);
            const summaryPath = path.join(targetFolder, `summary_${timestamp}.md`);
            
            // Save enriched leads with proper CSV formatting
            const csvOutput = stringify(enrichedLeads, {
                header: true,
                quoted_string: true,
                record_delimiter: 'windows',
                quoted: true,
                escape: '"',
                columns: [
                    // Core lead information
                    'email',
                    'firstName',
                    'lastName',
                    'companyName',
                    'industry',
                    'auth0_solution',
                    
                    // CISO-specific variables
                    'security_priorities',
                    'security_initiative',
                    'compliance_needs',
                    'risk_focus',
                    
                    // Email content
                    'subject',
                    'message'
                ]
            });
            
            fs.writeFileSync(outputPath, csvOutput, { encoding: 'utf8' });
            
            // Generate and save summary
            const summary = this.generateSummary(processingResults);
            fs.writeFileSync(summaryPath, summary, 'utf-8');
            
            console.log('\nProcessing Results:');
            console.log(JSON.stringify(processingResults, null, 2));
            console.log('\n✅ Processing complete!\n');
            console.log(`📝 Results saved to: ${outputPath}`);
            console.log(`📊 Summary saved to: ${summaryPath}\n`);
            
        } catch (error) {
            console.error('Error processing leads:', error);
            throw error;
        }
    }

    generateSummary(processingResults) {
        const summary = `# Lead Enrichment Summary
------------------------------

## Processing Statistics
- Total Leads: ${processingResults.total}
- Successfully Processed: ${processingResults.successful}
- Failed: ${processingResults.failed}
- Success Rate: ${((processingResults.successful / processingResults.total) * 100).toFixed(1)}%

## Processing Details
${processingResults.errors.length > 0 ? `
### Failed Leads:
${processingResults.errors.map(error => `- ${error.email}: ${error.error || JSON.stringify(error.issues)}`).join('\n')}` : ''}

## Generated Content
- Enriched CSV with ${processingResults.successful} leads
- ${processingResults.successful} personalized sequences
- All variables match Lemlist requirements

## Next Steps
1. Import enriched CSV into Lemlist
2. Review and customize sequences as needed
3. Set up campaigns using the generated templates

------------------------------
Generated: ${new Date().toISOString()}
`;
        return summary;
    }
}

// Main execution
async function main() {
    const enrichment = new LemlistEnrichment();
    const inputFile = process.argv[2];
    const outputDir = path.join(process.cwd(), 'outreach-messages/enriched');
    await enrichment.processLeads(inputFile, outputDir);
}

main().catch(console.error);
