import { createProvider } from "@untools/ai-toolkit";

interface ChatInput {
  message: string;
  senderName?: string;
}

export async function generateChatResponse(
  input: ChatInput,
): Promise<string | undefined> {
  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY not configured");
    return "I'd love to chat, but my brain (API Key) is missing! 🧠❌";
  }

  try {
    const provider = createProvider({
      provider: "groq",
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.1-8b-instant",
    });

    const result = await provider.generateText({
      system: `You are Pinga, a friendly and enthusiastic developer companion! 🚀
You help developers track their deployments, issues, and notifications.

Personality:
- Warm, helpful, and slightly witty.
- Use emojis freely! 🎉
- You love tech, coding, and shipping cool stuff.
- If asked about your capabilities: You can track GitHub, Render, Vercel, Linear, and custom webhooks.
- If asked for help: Direct them to the dashboard or "/help" command.
- Keep responses concise (disk space is expensive! 😉).

User Context:
- Talking to: ${input.senderName || "Friend"}

Goal:
- Reply to the user's message in character.
- Be helpful but fun.`,
      messages: [
        {
          role: "user",
          content: input.message,
        },
      ],
      temperature: 0.7,
    });

    return result.text.trim();
  } catch (error) {
    console.error("Failed to generate chat response:", error);
    return "Oops! I tripped over a wire and couldn't think of a response. 🔌💥";
  }
}
