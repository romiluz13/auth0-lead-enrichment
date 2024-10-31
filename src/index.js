import { ResearchAgent } from './agents/ResearchAgent.js';
import { Auth0Specialist } from './agents/auth0Specialist.js';
import fs from 'fs/promises';

async function main() {
  try {
    const companies = (await fs.readFile('companies.txt', 'utf-8'))
      .split('\n')
      .filter(line => line.trim().length > 0);

    const researcher = new ResearchAgent();
    const specialist = new Auth0Specialist();

    for (const company of companies) {
      console.log(`\nProcessing ${company}...`);
      
      try {
        // Research phase with timeout
        const researchPromise = researcher.analyze(company);
        const research = await Promise.race([
          researchPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Research timeout')), 60000)
          )
        ]);
        console.log('Research completed');

        // Analysis phase with timeout
        const analysisPromise = specialist.analyzeSolution(research);
        const solution = await Promise.race([
          analysisPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Analysis timeout')), 30000)
          )
        ]);
        console.log('Solution analysis completed');

        // Save results
        await fs.mkdir('output', { recursive: true });
        await fs.writeFile(
          `output/${company.toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`,
          JSON.stringify({ research, solution }, null, 2)
        );
        console.log(`Results saved for ${company}`);
        
        // Add delay between companies to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error) {
        console.error(`Error processing ${company}:`, error.message);
        continue; // Continue with next company
      }
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main();