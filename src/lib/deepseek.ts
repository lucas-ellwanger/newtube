import { OpenAI } from "openai";

export const deepseek = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});
