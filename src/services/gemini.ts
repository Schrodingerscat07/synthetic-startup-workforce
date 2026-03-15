/**
 * Gemini AI Client
 * 
 * Centralized Gemini SDK initialization and helper utilities.
 * Uses the VITE_GEMINI_API_KEY environment variable.
 */

import { GoogleGenAI } from '@google/genai';

let _client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (_client) return _client;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Missing VITE_GEMINI_API_KEY in .env file. ' +
      'Get your key at https://aistudio.google.com/apikey and add it to the .env file in the project root.'
    );
  }

  _client = new GoogleGenAI({ apiKey });
  return _client;
}

/** Model to use for all generations */
export const MODEL_ID = 'gemini-2.0-flash';

/**
 * Simple text generation helper.
 * Returns the full text response.
 */
export async function generateText(
  systemInstruction: string,
  userPrompt: string,
): Promise<string> {
  const client = getGeminiClient();

  const response = await client.models.generateContent({
    model: MODEL_ID,
    contents: userPrompt,
    config: {
      systemInstruction,
      temperature: 0.8,
    },
  });

  return response.text ?? '';
}

/**
 * Streaming text generation helper.
 * Calls onChunk for each text chunk as it arrives.
 * Returns the full accumulated text.
 */
export async function generateTextStream(
  systemInstruction: string,
  userPrompt: string,
  onChunk: (chunk: string, accumulated: string) => void,
): Promise<string> {
  const client = getGeminiClient();

  const response = await client.models.generateContentStream({
    model: MODEL_ID,
    contents: userPrompt,
    config: {
      systemInstruction,
      temperature: 0.8,
    },
  });

  let accumulated = '';
  for await (const chunk of response) {
    const text = chunk.text ?? '';
    if (text) {
      accumulated += text;
      onChunk(text, accumulated);
    }
  }

  return accumulated;
}

/**
 * JSON generation helper.
 * Uses Gemini's JSON response mode for structured output.
 */
export async function generateJSON<T>(
  systemInstruction: string,
  userPrompt: string,
): Promise<T> {
  const client = getGeminiClient();

  const response = await client.models.generateContent({
    model: MODEL_ID,
    contents: userPrompt,
    config: {
      systemInstruction,
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  });

  const text = response.text ?? '{}';
  return JSON.parse(text) as T;
}
