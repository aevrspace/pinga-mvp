import { config } from "./config";

interface StoredPayload {
  id: string;
  source: string;
  payload: unknown;
  receivedAt: string;
  expiresAt: string;
}

// In-memory storage (Note: This resets on each Vercel cold start)
// For persistent storage, consider using Vercel KV or a database
const payloads = new Map<string, StoredPayload>();

/**
 * Generate a UUID v4
 */
function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Store a webhook payload and return a unique ID
 */
export function storePayload(source: string, payload: unknown): string {
  const id = generateId();
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + config.storage.ttlHours * 60 * 60 * 1000
  );

  payloads.set(id, {
    id,
    source,
    payload,
    receivedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });

  // Clean up expired payloads
  cleanupExpired();

  return id;
}

/**
 * Get a stored payload by ID
 */
export function getPayload(id: string): StoredPayload | undefined {
  const stored = payloads.get(id);

  if (stored && new Date(stored.expiresAt) < new Date()) {
    payloads.delete(id);
    return undefined;
  }

  return stored;
}

/**
 * Get the public URL for a payload
 */
export function getPayloadUrl(id: string): string {
  const baseUrl = config.baseUrl;
  return `${baseUrl}/api/webhook/payload/${id}`;
}

/**
 * Remove expired payloads
 */
function cleanupExpired(): void {
  const now = new Date();
  for (const [id, stored] of payloads.entries()) {
    if (new Date(stored.expiresAt) < now) {
      payloads.delete(id);
    }
  }
}

/**
 * Get storage stats
 */
export function getStorageStats(): { count: number } {
  return { count: payloads.size };
}
