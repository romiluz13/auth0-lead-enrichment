import fs from 'fs/promises';

export async function processInput(input) {
  try {
    if (!input) {
      throw new Error('No input provided');
    }

    // If input is a file path
    if (input.endsWith('.txt')) {
      const fileContent = await fs.readFile(input, 'utf-8');
      return fileContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(name => ({ name }));
    }
    
    // Single company name
    return [{ name: input }];
  } catch (error) {
    console.error('Error processing input:', error.message);
    throw error;
  }
} 