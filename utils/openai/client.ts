import { AzureOpenAI } from "openai";

export const openai = new AzureOpenAI({
  baseURL: "https://azureaiapi.cloud.unc.edu/openai",
  apiKey: process.env.OPENAI_KEY!,
  apiVersion: "2024-06-01",
});
