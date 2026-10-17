import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// tiny .env loader (no external deps)
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dir, "..", ".env");
try {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
} catch {}

const { AiChatbotService, llmConfigFromEnv, createLLMCaller } =
  await import("../dist/src/index.js");

const config = llmConfigFromEnv(process.env);
if (!config) {
  console.log("AI provider not configured. Set AI_API_KEY / AI_MODEL / AI_BASE_URL in ai/.env");
  process.exit(0);
}

const chatbot = new AiChatbotService({ llm: createLLMCaller(config) });

const cases = [
  "I need a 2-bedroom apartment for rent in New Cairo under 20000",
  "أريد شقة للإيجار في التجمع بسعر 15000",
  "I need an apartment",
];

for (const msg of cases) {
  console.log("\nUSER:", msg);
  try {
    const res = await chatbot.handleMessage("smoke-conv", msg);
    console.log("AI:", JSON.stringify(res, null, 2));
  } catch (e) {
    console.log("ERROR:", e.message);
  }
}

console.log("\nSearch payload:", JSON.stringify(chatbot.toSearchRequest("smoke-conv"), null, 2));
