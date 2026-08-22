import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEMORY_FILE = path.join(__dirname, 'memory.json');

// Initialize memory file
if (!fs.existsSync(MEMORY_FILE)) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify([]));
}

// Initialize server
const server = new Server(
  {
    name: "mem0-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "add_memory",
        description: "Add a new memory or fact about the user or project context for long-term storage.",
        inputSchema: {
          type: "object",
          properties: {
            fact: { type: "string", description: "The memory to store" },
            userId: { type: "string", description: "The user identifier (default: 'antigravity_user')" }
          },
          required: ["fact"]
        }
      },
      {
        name: "search_memory",
        description: "Search past memories and facts stored in long-term memory.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
            userId: { type: "string", description: "The user identifier (default: 'antigravity_user')" }
          },
          required: ["query"]
        }
      }
    ]
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const userId = args?.userId || "antigravity_user";

  if (name === "add_memory") {
    const fact = args?.fact;
    if (!fact) {
      throw new Error("Missing required argument: fact");
    }
    
    const memories = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf-8'));
    memories.push({ id: Date.now().toString(), fact, userId, timestamp: new Date().toISOString() });
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memories, null, 2));
    
    return {
      content: [
        { type: "text", text: `Memory successfully added: "${fact}"` }
      ]
    };
  }
  
  if (name === "search_memory") {
    const query = args?.query;
    if (!query) {
      throw new Error("Missing required argument: query");
    }
    
    const memories = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf-8'));
    const userMemories = memories.filter(m => m.userId === userId);
    
    // Basic keyword search
    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const results = userMemories.map(m => {
      let score = 0;
      const text = m.fact.toLowerCase();
      keywords.forEach(k => { if (text.includes(k)) score++; });
      return { ...m, score };
    }).filter(m => m.score > 0 || keywords.length === 0).sort((a, b) => b.score - a.score);
    
    // If no exact keyword match, return all user memories as a fallback
    const finalResults = results.length > 0 ? results : userMemories;
    
    return {
      content: [
        { type: "text", text: JSON.stringify(finalResults, null, 2) }
      ]
    };
  }

  throw new Error(`Tool not found: ${name}`);
});

// Start the server using stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Mem0 MCP Server successfully running on stdio");
