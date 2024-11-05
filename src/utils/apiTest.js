import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export async function testOpenAIConnection() {
    console.log('\n🔍 Testing OpenAI Connection...');
    
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    console.log('API Key Format:', apiKey.substring(0, 10) + '...');
    
    const openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
    });

    try {
        // Simple test call
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "Test" }],
            max_tokens: 5
        });
        
        console.log('✅ OpenAI Connection Successful');
        return true;
    } catch (error) {
        console.error('❌ OpenAI Connection Failed');
        console.error('Error Type:', error.constructor.name);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        if (error.response) {
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        }
        return false;
    }
} 