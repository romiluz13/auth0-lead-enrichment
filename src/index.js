import { OutreachCrew } from './crews/OutreachCrew.js';
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function processLinkedInData(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const leads = JSON.parse(data);
    
    console.log('\n📊 Found', leads.leads.length, 'leads to process');
    console.log('Starting personalized outreach generation...\n');

    const crew = new OutreachCrew();
    const results = await crew.processLeads({ leads: leads.leads });

    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'outreach-messages');
    await fs.mkdir(outputDir, { recursive: true });

    // Generate individual message files for easy copy/paste
    for (const result of results.results) {
      if (result.metadata?.status === 'success') {
        const message = formatMessage(result);
        const fileName = `${result.lead.company.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        await fs.writeFile(path.join(outputDir, fileName), message);
      }
    }

    // Generate summary report
    const summary = generateSummary(results);
    await fs.writeFile(path.join(outputDir, '_summary.txt'), summary);

    console.log('\n✅ Processing complete!');
    console.log(`\n📝 Messages saved in: ${outputDir}`);
    console.log('\nEach message is saved in its own file for easy copy/paste.');
    console.log('Review _summary.txt for processing results.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

function formatMessage(result) {
  const { outreach, research } = result;
  
  return `
To: ${research.contactInfo.name}
Role: ${research.contactInfo.title}
Company: ${research.companyInfo.name}

Subject: ${outreach.subject}

${outreach.body}

---
Generated for: ${research.companyInfo.name}
Industry: ${research.companyInfo.industry}
Quality Score: ${result.qualityScore.score.toFixed(2)}

Follow-up Strategy:
${JSON.stringify(outreach.followUpStrategy, null, 2)}
`;
}

function generateSummary(results) {
  return `
Auth0 Outreach Summary
=====================

Processing Results:
- Total Leads: ${results.report.summary.totalLeads}
- Successfully Processed: ${results.report.summary.successful}
- High Quality Messages (>0.8): ${results.report.qualityMetrics.highQualityOutreach}
- Average Quality Score: ${results.report.summary.averageQualityScore.toFixed(2)}

Quality Metrics:
- High Quality: ${results.report.qualityMetrics.highQualityOutreach}
- Medium Quality: ${results.report.qualityMetrics.mediumQualityOutreach}
- Low Quality: ${results.report.qualityMetrics.lowQualityOutreach}

Processing Time:
- Total Time: ${(results.report.timing.totalExecutionTime / 1000).toFixed(2)}s
- Average Per Lead: ${(results.report.timing.averageTimePerLead / 1000).toFixed(2)}s

Individual Results:
${results.results.map(r => `- ${r.lead.company}: ${r.metadata.status} (Quality: ${r.qualityScore?.score.toFixed(2) || 'N/A'})`).join('\n')}
`;
}

// Main CLI interface
async function main() {
  console.log('\n🚀 Auth0 Sales Outreach Generator');
  console.log('================================\n');
  
  // Use sample leads by default
  const sampleLeadsPath = path.join(process.cwd(), 'src', 'data', 'sample-leads.json');
  console.log('Using sample AI companies for demonstration...\n');
  
  await processLinkedInData(sampleLeadsPath);
}

// Run the CLI
main().catch(console.error);
