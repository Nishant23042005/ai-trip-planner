import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build",
  baseURL: process.env.OPENAI_API_BASE_URL || undefined,
});

export default openai;
