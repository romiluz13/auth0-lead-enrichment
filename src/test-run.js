import { OutreachCrew } from './crews/OutreachCrew.js';
import fs from 'fs/promises';

async function testRun() {
  try {
    console.log('🚀 Starting test run with AI companies...\n');

    const testLeads = [
      {
        company: "AI21 Labs",
        contactPerson: {
          name: "Ori Goshen",
          title: "CEO & Co-Founder",
          email: "contact@ai21.com"
        },
        type: "AI/ML",
        market: "Israel",
        industry: "Artificial Intelligence",
        size: "Growth",
        website: "ai21.com",
        techStack: ["Python", "React", "AWS"],
        priority: "High",
        description: "AI21 Labs develops advanced language models and AI writing tools"
      },
      {
        company: "D-ID",
        contactPerson: {
          name: "Gil Perry",
          title: "CEO & Co-Founder",
          email: "contact@d-id.com"
        },
        type: "AI/ML",
        market: "Israel",
        industry: "Computer Vision/AI",
        size: "Growth",
        website: "d-id.com",
        techStack: ["Python", "TensorFlow", "AWS"],
        priority: "High",
        description: "D-ID creates AI-powered creative tools for video and images"
      },
      {
        company: "Tabnine",
        contactPerson: {
          name: "Dror Weiss",
          title: "CEO",
          email: "contact@tabnine.com"
        },
        type: "AI/ML",
        market: "Israel",
        industry: "Developer Tools",
        size: "Growth",
        website: "tabnine.com",
        techStack: ["Python", "TypeScript", "Cloud"],
        priority: "High",
        description: "Tabnine provides AI-powered code completion and assistance"
      }
    ];

    console.log('📋 Target Companies:');
    testLeads.forEach(lead => {
      console.log(`   • ${lead.company} (${lead.contactPerson.name} - ${lead.contactPerson.title})`);
    });
    console.log('\n');

    // Create and execute outreach crew
    const crew = new OutreachCrew(testLeads);
    console.log('Created OutreachCrew instance');

    const results = await crew.execute();
    console.log('Executed crew tasks');

    // Create output directory
    await fs.mkdir('test-output', { recursive: true });

    console.log('\n📊 Results Summary:');
    for (const result of results) {
      const filename = `test-output/${result.lead.company.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
      if (!result.error) {
        await fs.writeFile(filename, JSON.stringify({
          lead: result.lead,
          research: result.research,
          solution: result.solution,
          outreach: result.outreach
        }, null, 2));
        console.log(`✅ ${result.lead.company} - Success`);
      } else {
        console.error(`❌ ${result.lead.company} - Failed: ${result.error}`);
      }
    }

    console.log('\n✨ Test run completed!');
    console.log('📁 Results saved in test-output directory');

  } catch (error) {
    console.error('❌ Error during test run:', error);
  }
}

// Run the test
console.log('Starting test script...');
testRun().catch(error => {
  console.error('Fatal error:', error);
});