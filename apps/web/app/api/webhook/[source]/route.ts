import { NextRequest, NextResponse } from "next/server";
import { analyzeWebhook } from "@/lib/webhook/analyzers";
import { storePayload, getPayloadUrl } from "@/lib/webhook/storage";
import { sendNotification } from "@/lib/webhook/telegram";
import { validateConfig } from "@/lib/webhook/config";

interface RouteParams {
  params: Promise<{ source: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { source } = await params;

  // Validate config
  const { valid, errors } = validateConfig();
  if (!valid) {
    console.error("Config validation failed:", errors);
    return NextResponse.json(
      { error: "Server configuration error", details: errors },
      { status: 500 }
    );
  }

  try {
    // Parse webhook payload
    const payload = await request.json();

    // Get headers as plain object
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    // Store payload and get unique URL
    const payloadId = storePayload(source, payload);
    const payloadUrl = getPayloadUrl(payloadId);

    // Analyze the webhook with source hint
    const result = analyzeWebhook(payload, headers, source);

    // Send Telegram notification
    const sent = await sendNotification({
      ...result.notification,
      payloadUrl,
    });

    return NextResponse.json({
      success: true,
      source: result.source,
      sourceHint: source,
      payloadId,
      payloadUrl,
      telegramSent: sent,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook", details: String(error) },
      { status: 500 }
    );
  }
}
