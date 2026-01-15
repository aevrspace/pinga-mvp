import type { WebhookAnalyzer, AnalyzerResult } from "../analyzers";

export const genericAnalyzer: WebhookAnalyzer = {
  name: "generic",
  canHandle: () => true,

  analyze(payload: unknown): AnalyzerResult {
    const p = payload as Record<string, unknown>;
    const fields: { label: string; value: string }[] = [];
    const links: { label: string; url: string }[] = [];

    const eventType = extractField(p, ["type", "event", "eventType", "action"]);
    const title = eventType
      ? formatEventType(String(eventType))
      : "Webhook Received";

    const status = extractField(p, ["status", "state", "result"]);
    if (status) fields.push({ label: "📊 Status", value: String(status) });

    const name = extractField(p, [
      "name",
      "project",
      "service",
      "serviceName",
      "app",
    ]);
    if (name) fields.push({ label: "📦 Name", value: String(name) });

    const env = extractField(p, ["environment", "env", "target"]);
    if (env) fields.push({ label: "🎯 Env", value: String(env) });

    const message = extractField(p, ["message", "description", "text"]);
    if (message)
      fields.push({ label: "💬", value: truncate(String(message), 60) });

    // Extract URLs
    const urls = extractUrls(p);
    urls.slice(0, 5).forEach(({ label, url }) => links.push({ label, url }));

    if (fields.length === 0) {
      const keys = Object.keys(p).slice(0, 5);
      if (keys.length)
        fields.push({ label: "📋 Fields", value: keys.join(", ") });
    }

    let emoji = "📡";
    if (status) {
      const s = String(status).toLowerCase();
      if (s.includes("success") || s.includes("ready") || s === "ok")
        emoji = "✅";
      else if (s.includes("fail") || s.includes("error")) emoji = "❌";
      else if (s.includes("pending") || s.includes("running")) emoji = "🔄";
    }

    return { source: "generic", notification: { title, emoji, fields, links } };
  },
};

function extractField(obj: Record<string, unknown>, fields: string[]): unknown {
  for (const f of fields) if (obj[f] !== undefined) return obj[f];
  for (const nested of ["data", "payload", "body"]) {
    if (typeof obj[nested] === "object" && obj[nested]) {
      const n = obj[nested] as Record<string, unknown>;
      for (const f of fields) if (n[f] !== undefined) return n[f];
    }
  }
  return undefined;
}

function extractUrls(
  obj: unknown,
  prefix = ""
): { label: string; url: string }[] {
  const urls: { label: string; url: string }[] = [];
  if (typeof obj !== "object" || !obj) {
    if (
      typeof obj === "string" &&
      (obj.startsWith("http://") || obj.startsWith("https://"))
    ) {
      urls.push({ label: formatLabel(prefix) || "Link", url: obj });
    }
    return urls;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) =>
      urls.push(...extractUrls(item, `${prefix}[${i}]`))
    );
    return urls;
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (
      typeof v === "string" &&
      (v.startsWith("http://") || v.startsWith("https://"))
    ) {
      urls.push({ label: formatLabel(k), url: v });
    } else if (typeof v === "object") {
      urls.push(...extractUrls(v, k));
    }
  }
  return urls;
}

function formatLabel(k: string): string {
  const map: Record<string, string> = {
    url: "Link",
    html_url: "View",
    preview_url: "Preview",
    previewUrl: "Preview",
    environment_url: "Environment",
    log_url: "Logs",
    compare: "Compare",
  };
  return (
    map[k] ||
    k
      .replace(/_url$/i, "")
      .replace(/Url$/i, "")
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function formatEventType(t: string): string {
  return t.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 3) + "...";
}
