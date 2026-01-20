"use client";

import { useState, useEffect } from "react";

export default function WebhookInfo({ userId }: { userId: string }) {
  const [copied, setCopied] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    // eslint-disable-next-line
    setOrigin(window.location.origin);
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const renderWebhookUrl = origin
    ? `${origin}/api/webhook/render?userId=${userId}`
    : "...";

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold mb-4">Developer Information</h2>
      <p className="text-sm text-gray-500 mb-4">
        Use these details to set up custom integrations or connect services like
        Render.
      </p>

      <div className="space-y-4">
        {/* User ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your User ID
          </label>
          <div className="flex gap-2">
            <code className="flex-1 bg-gray-50 p-2 rounded border text-sm font-mono overflow-x-auto flex items-center">
              {userId}
            </code>
            <button
              onClick={() => copyToClipboard(userId, "id")}
              className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors min-w-[80px]"
            >
              {copied === "id" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Render Webhook URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Render / Custom Webhook URL
          </label>
          <div className="flex gap-2">
            <code className="flex-1 bg-gray-50 p-2 rounded border text-sm font-mono overflow-x-auto whitespace-nowrap flex items-center">
              {renderWebhookUrl}
            </code>
            <button
              onClick={() => copyToClipboard(renderWebhookUrl, "url")}
              className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors min-w-[80px]"
              disabled={!origin}
            >
              {copied === "url" ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Use this URL for{" "}
            <a href="/help/render" className="text-blue-600 hover:underline">
              Render email forwarding
            </a>{" "}
            or generic webhooks.
          </p>
        </div>
      </div>
    </div>
  );
}
