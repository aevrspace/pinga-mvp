import { generateChatResponse } from "../lib/agents/chatAssistant";
import fs from "fs";
import path from "path";

// Manually load .env.local
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const firstEquals = line.indexOf("=");
    if (firstEquals !== -1) {
      const key = line.substring(0, firstEquals).trim();
      const value = line.substring(firstEquals + 1).trim();
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
}

async function testChat() {
  console.log("🤖 Testing AI Chat Assistant...\n");

  const inputs = [
    { message: "Hello! Who are you?", senderName: "Miracle" },
    { message: "Can you track Linear issues?", senderName: "Developer" },
    { message: "I'm bored, tell me a joke", senderName: "User" },
  ];

  for (const input of inputs) {
    console.log(`User (${input.senderName}): ${input.message}`);
    const response = await generateChatResponse(input);
    console.log(`Pinga: ${response}\n`);
  }
}

testChat().catch(console.error);
