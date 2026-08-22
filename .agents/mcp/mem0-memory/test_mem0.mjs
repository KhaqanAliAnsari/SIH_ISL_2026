import 'dotenv/config';
import { Memory } from "mem0ai/oss";

async function test() {
  try {
    console.log("Initializing Memory...");
    const memory = new Memory({
      llm: {
        provider: "openai",
        config: {
          model: "gemini-1.5-flash",
          apiKey: process.env.GEMINI_API_KEY,
          baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
        }
      },
      embedder: {
        provider: "openai",
        config: {
          model: "text-embedding-004",
          apiKey: process.env.GEMINI_API_KEY,
          baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
          embeddingDims: 768
        }
      },
      vectorStore: {
        provider: "memory",
        config: {
          dimension: 768
        }
      }
    });

    console.log("Memory initialized. Adding a test fact...");
    await memory.add("Antigravity agent is testing mem0", { userId: "test_user" });
    
    console.log("Memory added. Searching for the fact...");
    const results = await memory.search("Who is testing mem0?", { filters: { userId: "test_user" } });
    
    console.log("Search results:", JSON.stringify(results, null, 2));
    console.log("SUCCESS!");
  } catch (error) {
    console.error("FAILED:");
    console.error(error);
  }
}

test();
