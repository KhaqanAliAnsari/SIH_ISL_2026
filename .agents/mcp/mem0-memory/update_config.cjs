const fs = require('fs');
const path = 'C:\\Users\\11111\\.gemini\\config\\mcp_config.json';
const config = JSON.parse(fs.readFileSync(path, 'utf8'));

config.mcpServers["mem0-memory"] = {
  command: "node",
  args: ["c:\\Users\\11111\\Downloads\\SIH_ISL_2026\\.agents\\mcp\\mem0-memory\\index.mjs"]
};

fs.writeFileSync(path, JSON.stringify(config, null, 2));
console.log("mcp_config.json updated successfully.");
