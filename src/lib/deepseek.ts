import { OpenAI } from "openai";

export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});
