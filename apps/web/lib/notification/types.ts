import { Types } from "mongoose";

export interface NotificationPayload {
  title: string;
  emoji: string;
  fields: { label: string; value: string }[];
  links: { label: string; url: string }[];
  payloadUrl: string;
  // Metadata for AI/Routing
  source?: string;
  eventType?: string;
  summary?: string; // AI generated summary
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawPayload?: Record<string, any>; // Full webhook payload for filtering
}

export interface ChannelConfig {
  enabled: boolean;
  [key: string]: unknown;
}

export interface ChannelResult {
  success: boolean;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawError?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export interface NotificationChannel {
  name: string;
  type: string;
  send(
    config: ChannelConfig,
    notification: NotificationPayload,
  ): Promise<ChannelResult>;
}

export interface UserChannel {
  _id?: Types.ObjectId | string;
  type: string;
  config: ChannelConfig;
  enabled: boolean;
  name?: string;
  webhookRules?: {
    sources: {
      type: string;
      enabled: boolean;
      filters: {
        repositories?: string[];
        eventTypes?: string[];
        services?: string[];
        [key: string]: unknown;
      };
    }[];
  };
}
