import type { WebhookAnalyzer, AnalyzerResult } from "../analyzers";

interface VercelPayload {
  type?: string;
  payload?: {
    name?: string;
    url?: string;
    alias?: string[];
    target?: string;
    meta?: {
      githubCommitRef?: string;
      githubCommitMessage?: string;
      githubCommitSha?: string;
      githubCommitAuthorLogin?: string;
      githubRepo?: string;
      githubOrg?: string;
    };
    deployment?: {
      id?: string;
      name?: string;
      url?: string;
    };
    project?: {
      id?: string;
      name?: string;
    };
  };
}

const eventEmojis: Record<string, string> = {
  "deployment.created": "🔄",
  "deployment.ready": "✅",
  "deployment.succeeded": "✅",
  "deployment.error": "❌",
  "deployment.canceled": "⚪",
  "deployment.check-rerequested": "🔁",
  "project.created": "📁",
  "project.removed": "🗑️",
  "domain.created": "🌐",
};

const eventTitles: Record<string, string> = {
  "deployment.created": "Deployment Started",
  "deployment.ready": "Deployment Ready",
  "deployment.succeeded": "Deployment Succeeded",
  "deployment.error": "Deployment Failed",
  "deployment.canceled": "Deployment Canceled",
  "deployment.check-rerequested": "Deployment Check Requested",
  "project.created": "Project Created",
  "project.removed": "Project Removed",
  "domain.created": "Domain Added",
};

export const vercelAnalyzer: WebhookAnalyzer = {
  name: "vercel",

  canHandle(payload: unknown): boolean {
    const p = payload as VercelPayload;
    return (
      typeof p?.type === "string" &&
      (p.type.startsWith("deployment.") ||
        p.type.startsWith("project.") ||
        p.type.startsWith("domain."))
    );
  },

  analyze(payload: unknown): AnalyzerResult {
    const p = payload as VercelPayload;
    const type = p.type || "unknown";
    const data = p.payload || {};
    const meta = data.meta || {};

    const emoji = eventEmojis[type] || "📦";
    const title = eventTitles[type] || formatEventType(type);

    const fields: { label: string; value: string }[] = [];
    const links: { label: string; url: string }[] = [];

    // Project name
    const projectName =
      data.name || data.project?.name || data.deployment?.name;
    if (projectName) {
      fields.push({ label: "📦 Project", value: projectName });
    }

    // Branch
    if (meta.githubCommitRef) {
      fields.push({ label: "🌿 Branch", value: meta.githubCommitRef });
    }

    // Target environment
    if (data.target) {
      fields.push({ label: "🎯 Target", value: data.target });
    }

    // Commit message
    if (meta.githubCommitMessage) {
      const message = meta.githubCommitMessage.split("\n")[0];
      fields.push({ label: "📝 Commit", value: truncate(message, 60) });
    }

    // Author
    if (meta.githubCommitAuthorLogin) {
      fields.push({ label: "👤 Author", value: meta.githubCommitAuthorLogin });
    }

    // Preview URL
    const previewUrl = data.url || (data.alias && data.alias[0]);
    if (previewUrl) {
      const url = previewUrl.startsWith("http")
        ? previewUrl
        : `https://${previewUrl}`;
      links.push({ label: "Preview", url });
    }

    // GitHub commit link
    if (meta.githubOrg && meta.githubRepo && meta.githubCommitSha) {
      links.push({
        label: "Commit",
        url: `https://github.com/${meta.githubOrg}/${meta.githubRepo}/commit/${meta.githubCommitSha}`,
      });
    }

    return {
      source: "vercel",
      notification: { title, emoji, fields, links },
    };
  },
};

function formatEventType(type: string): string {
  return type.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}
