import dotenv from 'dotenv';
import path from 'path';
import type { AppConfig } from '../../../shared/types';

// Load environment variables from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * Load and validate environment configuration
 * Throws error if required variables are missing or invalid
 */
function loadConfig(): AppConfig {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required in environment variables');
  }

  if (!apiKey.startsWith('sk-ant-')) {
    throw new Error('Invalid ANTHROPIC_API_KEY format');
  }

  const nodeEnv = process.env.NODE_ENV || 'development';

  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    throw new Error(`Invalid NODE_ENV: ${nodeEnv}`);
  }

  const port = parseInt(process.env.PORT || '3000', 10);

  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${process.env.PORT}`);
  }

  return {
    anthropicApiKey: apiKey,
    nodeEnv: nodeEnv as 'development' | 'production' | 'test',
    port,
  };
}

export const config = loadConfig();
