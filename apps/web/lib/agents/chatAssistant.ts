import { ToolLoopAgent, ModelMessage, tool, stepCountIs } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

interface ChatInput {
  message: string;
  senderName?: string;
  history?: ModelMessage[];
}

export async function generateChatResponse(
  input: ChatInput,
): Promise<{ text: string; history: ModelMessage[] } | undefined> {
  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY not configured");
    return {
      text: "I'd love to chat, but my brain (API Key) is missing! 🧠❌",
      history: [],
    };
  }

  const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const agent = new ToolLoopAgent({
      model: groq("llama-3.3-70b-versatile"),
      instructions: `You are Pinga, a friendly and enthusiastic developer companion! 🚀
You help developers track their deployments, issues, and notifications.

Personality:
- Warm, helpful, and slightly witty.
- Use emojis freely! 🎉
- You love tech, coding, and shipping cool stuff.
- If asked about your capabilities: You can track GitHub, Render, Vercel, Linear, and custom webhooks.
- If asked for help: Direct them to the dashboard or "/help" command.
- Keep responses concise within telegram limits.

Talking to: ${input.senderName || "Friend"}`,
      tools: {
        get_current_time: tool({
          description: "Get the current server time",
          parameters: z.object({}),
          execute: async () => new Date().toLocaleString(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any),
        get_project_stats: tool({
          description: "Get current project statistics (mock)",
          parameters: z.object({}),
          execute: async () => ({
            deployments: 42,
            notifications_sent: 1337,
            uptime: "99.9%",
          }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any),
      },
      stopWhen: stepCountIs(5), // Allow up to 5 steps for tool usage
    });

    const result = await agent.generate({
      messages: [
        ...(input.history || []),
        { role: "user", content: input.message },
      ],
    });

    console.log("[ChatAssistant] Agent Result:", {
      text: result.text,
      toolCallsLen: result.toolCalls?.length,
      finishReason: result.finishReason,
    });

    return {
      text: result.text,
      history: [], // Still empty as per MVP plan
    };
  } catch (error) {
    console.error("Failed to generate chat response:", error);
    return {
      text: "Oops! I tripped over a wire and couldn't think of a response. 🔌💥",
      history: [],
    };
  }
}
