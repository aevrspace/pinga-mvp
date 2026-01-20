import { parseMarkdown } from "@/lib/markdown";
import fs from "fs/promises";
import path from "path";
import Link from "next/link";

interface HelpPageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

const guides = [
  {
    slug: "getting-started",
    title: "Getting Started",
    description: "Set up your first notification channel in 5 minutes",
    icon: "🚀",
  },
  {
    slug: "filtering",
    title: "Webhook Filtering",
    description: "Control which events trigger notifications",
    icon: "🎯",
  },
  {
    slug: "telegram-groups",
    title: "Telegram Group Chats",
    description: "Connect team group chats for collaboration",
    icon: "👥",
  },
  {
    slug: "sources",
    title: "Webhook Sources",
    description: "Connect GitHub, Render, Vercel, and more",
    icon: "🔗",
  },
];

export default async function HelpPage({ params }: HelpPageProps) {
  const { slug: slugArray } = await params;
  const slug = slugArray?.[0];

  // If no slug, show help index
  if (!slug) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              📚 Pinga Help Center
            </h1>
            <p className="text-xl text-gray-600">
              Everything you need to master your notification hub
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/help/${guide.slug}`}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="text-4xl mb-3">{guide.icon}</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {guide.title}
                </h2>
                <p className="text-gray-600">{guide.description}</p>
                <div className="mt-4 text-blue-600 font-medium flex items-center gap-2">
                  Read guide
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          <div className="bg-white rounded-xl p-8 shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Quick Links</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <span className="text-2xl">⚙️</span>
                <span>Settings Dashboard</span>
              </Link>
              <a
                href="https://github.com/yourrepo/pinga"
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="text-2xl">🐛</span>
                <span>Report an Issue</span>
              </a>
              <a
                href="https://t.me/pingacommunity"
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="text-2xl">💬</span>
                <span>Join Community</span>
              </a>
              <a
                href="mailto:support@pinga.app"
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <span className="text-2xl">📧</span>
                <span>Email Support</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Load markdown content
  let html: string;
  let contentError = false;

  try {
    const contentPath = path.join(process.cwd(), "content", `${slug}.md`);
    const content = await fs.readFile(contentPath, "utf-8");
    html = await parseMarkdown(content);
  } catch {
    contentError = true;
  }

  // Handle error case
  if (contentError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Guide Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The guide you&apos;re looking for doesn&apos;t exist yet.
          </p>
          <Link
            href="/help"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Help Center
          </Link>
        </div>
      </div>
    );
  }

  const guide = guides.find((g) => g.slug === slug);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/help"
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-4 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Help Center
          </Link>
          {guide && (
            <>
              <div className="text-5xl mb-4">{guide.icon}</div>
              <h1 className="text-4xl font-bold mb-2">{guide.title}</h1>
              <p className="text-xl text-blue-100">{guide.description}</p>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-12 px-4">
        <article
          className="prose prose-lg prose-blue max-w-none
            prose-headings:font-bold
            prose-h1:text-4xl prose-h1:mb-4
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b-2 prose-h2:border-gray-200
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-gray-900 prose-pre:text-gray-100
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-1 prose-blockquote:px-4
            prose-ul:list-disc prose-ul:pl-6
            prose-ol:list-decimal prose-ol:pl-6
            prose-li:text-gray-700 prose-li:my-1
            prose-img:rounded-lg prose-img:shadow-lg
            prose-table:border prose-table:border-gray-300
            prose-th:bg-gray-50 prose-th:p-3
            prose-td:p-3 prose-td:border prose-td:border-gray-200"
          dangerouslySetInnerHTML={{ __html: html! }}
        />
      </div>

      {/* Footer Navigation */}
      <div className="max-w-4xl mx-auto px-4 py-8 border-t">
        <h3 className="text-lg font-semibold mb-4">More Guides</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {guides
            .filter((g) => g.slug !== slug)
            .slice(0, 3)
            .map((guide) => (
              <Link
                key={guide.slug}
                href={`/help/${guide.slug}`}
                className="p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="text-3xl mb-2">{guide.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {guide.title}
                </h4>
                <p className="text-sm text-gray-600">{guide.description}</p>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
