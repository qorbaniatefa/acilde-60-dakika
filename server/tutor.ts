import type { GoogleGenAI } from '@google/genai';
import { SYSTEM_INSTRUCTION, getSceneContextForTutor } from './geminiTutorPrompt.ts';
import type { TutorGenerator } from './app.ts';

export function createGeminiGenerator(client: GoogleGenAI, model: string): TutorGenerator {
  return async ({ decisionId, profile, thought }, signal) => {
    const response = await client.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: thought }] }],
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION}\n\n${getSceneContextForTutor(decisionId, profile)}`,
        abortSignal: signal,
        httpOptions: { timeout: 15000, retryOptions: { attempts: 1 } },
      },
    });
    return response.text?.trim() || '';
  };
}
