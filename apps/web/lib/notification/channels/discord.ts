import {
  NotificationChannel,
  ChannelConfig,
  NotificationPayload,
  ChannelResult,
} from "../types";

export class DiscordChannel implements NotificationChannel {
  name = "Discord";
  type = "discord";

  async send(
    config: ChannelConfig,
    notification: NotificationPayload,
  ): Promise<ChannelResult> {
    if (!config.enabled) return { success: false, error: "Channel disabled" };

    const webhookUrl = config.webhookUrl as string;

    if (!webhookUrl) {
      console.warn("Discord channel missing webhookUrl");
      return { success: false, error: "Missing Discord webhookUrl" };
    }

    // Map fields to Discord Embed Fields
    const fields = notification.fields.map((f) => ({
      name: f.label,
      value: f.value,
      inline: true,
    }));

    // Add Links as a field if present
    if (notification.links.length > 0) {
      const linksText = notification.links
        .map((l) => `[${l.label}](${l.url})`)
        .join("\n");
      fields.push({
        name: "Links",
        value: linksText,
        inline: false,
      });
    }

    // Construct Embed
    const embed = {
      title: `${notification.emoji} ${notification.title}`,
      description: notification.summary || undefined, // Use summary if available
      url: notification.payloadUrl,
      color: 5814783, // #5865F2 (Discord Blurple)
      fields: fields,
      footer: {
        text: `Source: ${notification.source || "System"}`,
      },
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [embed],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let rawError: any = errorText;
        try {
          rawError = JSON.parse(errorText);
        } catch {
          // ignore
        }

        console.error("Discord API error:", response.status, errorText);
        return {
          success: false,
          error: `Discord API error: ${response.status} - ${errorText}`,
          rawError: {
            status: response.status,
            response: rawError,
          },
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Failed to send Discord message:", error);
      return { success: false, error: String(error), rawError: error };
    }
  }
}

export const discordChannel = new DiscordChannel();
