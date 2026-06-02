import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || 'dummy_gemini_key_for_builds';

/**
 * Singleton Google GenAI client instance to avoid repeated authorization overhead.
 */
export const gemini = new GoogleGenAI({
  apiKey,
});
