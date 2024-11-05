import dotenv from 'dotenv';
import { Logger } from '../src/utils/logger.js';

dotenv.config();

// Set logging level for tests
Logger.setLevel(Logger.levels.ERROR);

// Global test timeout
jest.setTimeout(30000);

// Mock environment variables if not present
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test_openai_key';
process.env.SERPER_API_KEY = process.env.SERPER_API_KEY || 'test_serper_key';