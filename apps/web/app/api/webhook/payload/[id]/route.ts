import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "@/lib/webhook/storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const stored = getPayload(id);

  if (!stored) {
    return NextResponse.json(
      { error: "Payload not found or expired" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: stored.id,
    source: stored.source,
    receivedAt: stored.receivedAt,
    expiresAt: stored.expiresAt,
    payload: stored.payload,
  });
}
