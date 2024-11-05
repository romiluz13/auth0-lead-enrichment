import { OutreachCrew } from './crews/OutreachCrew.js';
import testLeads from './data/test-leads.json' assert { type: "json" };

async function runTest() {
  console.log('\n🚀 Starting Auth0 Sales Agent Test Run\n');
  
  try {
    const crew = new OutreachCrew();
    
    console.log('Test Lead:', testLeads.leads[0].company);
    console.log('Industry:', testLeads.leads[0].industry);
    console.log('Contact:', testLeads.leads[0].contactPerson.name);
    console.log('Role:', testLeads.leads[0].contactPerson.title);
    console.log('\n---\n');

    // Process the test lead
    const result = await crew.processLeads(testLeads);
    
    // Display the results
    console.log('\n📊 Results Summary\n');
    console.log('Execution Report:', result.report);

    const successfulOutreach = result.results.find(r => r.metadata?.status === 'success');
    if (successfulOutreach) {
      console.log('\n📧 Generated Outreach\n');
      console.log('Subject:', successfulOutreach.outreach.subject);
      console.log('\nBody:', successfulOutreach.outreach.body);
      console.log('\nCall to Action:', successfulOutreach.outreach.callToAction);
      
      console.log('\n📈 Quality Metrics\n');
      console.log('Personalization Score:', successfulOutreach.qualityScore.score.toFixed(2));
      console.log('Pain Points:', successfulOutreach.outreach.metadata.targetedPainPoints);
      console.log('Value Propositions:', successfulOutreach.outreach.metadata.valueProposition);
      
      if (successfulOutreach.qualityScore.suggestions.length > 0) {
        console.log('\n💡 Improvement Suggestions\n');
        successfulOutreach.qualityScore.suggestions.forEach((suggestion, i) => {
          console.log(`${i + 1}. ${suggestion}`);
        });
      }

      console.log('\n📋 Follow-up Strategy\n');
      console.log(successfulOutreach.outreach.followUpStrategy);
    }

    console.log('\n✅ Test Run Complete\n');

  } catch (error) {
    console.error('\n❌ Test Run Error:', error);
    process.exit(1);
  }
}

// Run the test
runTest().catch(console.error);
