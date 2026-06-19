import OpenAI from "openai";
import { getServerEnv } from "@/lib/env";

export function createOpenAIClient() {
  const env = getServerEnv();

  if (!env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  return new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });
}
