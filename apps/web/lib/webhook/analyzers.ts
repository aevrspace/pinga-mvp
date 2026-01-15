import type { TelegramNotification } from "./telegram";

export interface AnalyzerResult {
  notification: Omit<TelegramNotification, "payloadUrl">;
  source: string;
}

export interface WebhookAnalyzer {
  name: string;
  canHandle: (payload: unknown, headers: Record<string, string>) => boolean;
  analyze: (
    payload: unknown,
    headers: Record<string, string>
  ) => AnalyzerResult;
}

// Import all analyzers
import { vercelAnalyzer } from "./analyzers/vercel";
import { renderAnalyzer } from "./analyzers/render";
import { githubAnalyzer } from "./analyzers/github";
import { genericAnalyzer } from "./analyzers/generic";

// Analyzers in priority order
const analyzers: WebhookAnalyzer[] = [
  vercelAnalyzer,
  renderAnalyzer,
  githubAnalyzer,
  genericAnalyzer, // Always last as fallback
];

/**
 * Get the appropriate analyzer for a webhook payload
 */
export function getAnalyzer(
  payload: unknown,
  headers: Record<string, string>,
  sourceHint?: string
): WebhookAnalyzer {
  // If source hint provided, try that analyzer first
  if (sourceHint) {
    const hintedAnalyzer = analyzers.find(
      (a) => a.name.toLowerCase() === sourceHint.toLowerCase()
    );
    if (hintedAnalyzer && hintedAnalyzer.canHandle(payload, headers)) {
      return hintedAnalyzer;
    }
  }

  // Otherwise, find first matching analyzer
  for (const analyzer of analyzers) {
    if (analyzer.canHandle(payload, headers)) {
      return analyzer;
    }
  }

  // Should never reach here since generic always matches
  return genericAnalyzer;
}

/**
 * Analyze a webhook payload
 */
export function analyzeWebhook(
  payload: unknown,
  headers: Record<string, string>,
  sourceHint?: string
): AnalyzerResult {
  const analyzer = getAnalyzer(payload, headers, sourceHint);
  return analyzer.analyze(payload, headers);
}
