import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY || 'dummy_openai_key_for_builds';

/**
 * Singleton OpenAI client instance to avoid repeated authorization overhead
 * during high-frequency API route invocations.
 */
export const openai = new OpenAI({
  apiKey,
});
