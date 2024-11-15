import { LemlistEnrichment } from './lemlist-enrichment.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    try {
        console.log('🚀 Starting CISO Lead Enrichment...\n');
        
        const enrichment = new LemlistEnrichment();
        const inputFile = path.join(process.cwd(), 'CISO Changed recently Israel.csv');
        const outputDir = path.join(process.cwd(), 'outreach-messages/enriched');
        
        console.log(`📊 Processing CISO leads from: ${inputFile}`);
        console.log(`📝 Output will be saved to: ${outputDir}\n`);
        
        await enrichment.processLeads(inputFile, outputDir);
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

main().catch(console.error);
