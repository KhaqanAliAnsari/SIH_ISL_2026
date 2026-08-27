const fs = require('fs');
const os = require('os');
const path = require('path');

const configPath = path.join(os.homedir(), '.gemini', 'config', 'mcp_config.json');
let config = { mcpServers: {} };
if (fs.existsSync(configPath)) {
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {}
}
if (!config.mcpServers) config.mcpServers = {};

config.mcpServers["mem0"] = {
  command: "node",
  args: [path.join(__dirname, 'index.mjs')]
};

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log("mcp_config.json updated successfully at " + configPath);

