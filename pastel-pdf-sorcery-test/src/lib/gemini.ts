import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',  // Back to the new model
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 8192,
  },
});

export const startGeminiChat = async () => {
  const chat = geminiModel.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 8192,
    },
  });
  return chat;
};