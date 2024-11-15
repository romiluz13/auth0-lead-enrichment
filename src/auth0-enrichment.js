import { OutreachCrew } from './crews/OutreachCrew.js';
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { fileURLToPath } from 'url';

async function processAuth0Leads(inputCsvPath) {
  try {
    console.log('🚀 Starting Auth0 lead enrichment process...\n');

    // Read and parse input CSV
    const inputData = await fs.readFile(inputCsvPath, 'utf8');
    const rawRecords = parse(inputData, { columns: true, skip_empty_lines: true });
    
    // Map CSV fields to required format
    const records = rawRecords.map(record => ({
      company: record.companyName,
      description: record.companyDescription || record.summary || `${record.companyName} - ${record.industry}`,
      industry: record.industry,
      website: record.companyDomain,
      size: record.companySize,
      type: record.companyType,
      contactPerson: {
        name: `${record.firstName} ${record.lastName}`,
        title: record.occupation,
        email: record.email,
        department: 'Engineering'
      },
      location: {
        hq: record.companyHeadQuarter,
        office: record.location
      }
    }));
    
    console.log(`📊 Found ${records.length} leads to process`);
    console.log('Starting personalized variable generation...\n');

    const crew = new OutreachCrew();
    const results = await crew.processLeads({ leads: records });

    // Create output directory
    const outputDir = path.join(process.cwd(), 'outreach-messages/auth0/enriched');
    await fs.mkdir(outputDir, { recursive: true });

    // Transform results into enriched CSV with Lemlist variables
    const enrichedLeads = results.results.map(result => {
      if (result.metadata?.status !== 'success') {
        console.warn(`⚠️ Warning: Failed to process lead for ${result.lead.company}`);
        return null;
      }

      return {
        email: result.lead.contactPerson.email,
        firstName: result.lead.contactPerson.name.split(' ')[0],
        lastName: result.lead.contactPerson.name.split(' ')[1],
        companyName: result.lead.company,
        occupation: result.lead.contactPerson.title,
        industry: result.lead.industry,
        auth0_value_prop: result.variables.auth0_value_prop,
        security_challenge: result.variables.security_challenge,
        dev_benefit: result.variables.dev_benefit,
        tech_context: result.variables.tech_context,
        recent_achievement: result.variables.recent_achievement,
        leadership_focus: result.variables.leadership_focus,
        scale_context: result.variables.scale_context
      };
    }).filter(lead => lead !== null);

    // Generate enriched CSV
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(outputDir, `enriched_leads_${timestamp}.csv`);
    const csvOutput = stringify(enrichedLeads, { header: true });
    await fs.writeFile(outputPath, csvOutput);

    // Generate summary report
    const summaryPath = path.join(outputDir, `summary_${timestamp}.txt`);
    const summary = generateSummary(results, enrichedLeads.length);
    await fs.writeFile(summaryPath, summary);

    console.log('\n✅ Processing complete!');
    console.log(`\n📝 Enriched CSV saved to: ${outputPath}`);
    console.log(`📊 Summary saved to: ${summaryPath}\n`);

    return {
      success: true,
      enrichedLeadsPath: outputPath,
      summaryPath: summaryPath
    };

  } catch (error) {
    console.error('❌ Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function generateSummary(results, successfulLeads) {
  const total = results.results.length;
  const failed = total - successfulLeads;
  
  return `Auth0 Lead Enrichment Summary
${'-'.repeat(30)}

Total Leads Processed: ${total}
Successfully Enriched: ${successfulLeads}
Failed to Process: ${failed}

Processing Time: ${results.metadata.processingTime}ms
Average Time per Lead: ${Math.round(results.metadata.processingTime / total)}ms

${'-'.repeat(30)}
Generated: ${new Date().toISOString()}
`;
}

// CLI interface
async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('❌ Please provide the input CSV path');
    console.log('\nUsage: node auth0-enrichment.js <path-to-csv>');
    process.exit(1);
  }

  await processAuth0Leads(inputPath);
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}

export { processAuth0Leads };
