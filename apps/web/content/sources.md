# Webhook Sources

Pinga supports webhooks from a wide range of services. This guide covers all supported sources and how to set them up.

---

## GitHub

Track repository activity, pull requests, issues, deployments, and more.

### Installation via GitHub App (Recommended)

1. Go to **Settings** → **Integrations**
2. Click **Install GitHub App**
3. Select repositories to monitor
4. Grant permissions
5. Authorize the installation

**What you'll receive:**

- ⭐ Stars and forks
- 🐛 Issues opened/closed/commented
- 🔀 Pull requests created/merged/reviewed
- ✅ Workflow runs (CI/CD status)
- 🚀 Releases published
- 📝 Repository events

### Manual Webhook Setup

1. Go to your repository → **Settings** → **Webhooks**
2. Click **Add webhook**
3. **Payload URL**: `https://your-domain.com/api/webhook/github`
4. **Content type**: `application/json`
5. **Secret**: (optional, for security)
6. **Events**: Choose what to monitor
7. Click **Add webhook**

---

## Render

Get instant deployment notifications from Render.

### Email Forwarding Setup

Since Render doesn't support custom webhooks directly, we use email forwarding:

1. Copy your **Render Webhook URL** from Settings
   - Format: `https://your-domain.com/api/webhook/render?userId=YOUR_USER_ID`

2. Set up Google Apps Script email forwarder:

```javascript
// tools/render-email-forwarder.js
const WEBHOOK_URL = "YOUR_WEBHOOK_URL_HERE";

function processRenderEmails() {
  const threads = GmailApp.search("from:notify@render.com is:unread");

  threads.forEach((thread) => {
    const messages = thread.getMessages();
    messages.forEach((message) => {
      const subject = message.getSubject();
      const body = message.getPlainBody();

      const payload = {
        subject: subject,
        body: body,
        from: message.getFrom(),
        date: message.getDate().toISOString(),
      };

      UrlFetchApp.fetch(WEBHOOK_URL, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
      });

      message.markRead();
    });
  });
}
```

3. Set up a time-based trigger to run every minute

**What you'll receive:**

- 🚀 Deployment started
- ✅ Deployment succeeded
- ❌ Deployment failed
- 🔄 Service updates
- 💰 Billing alerts

---

## Vercel

Monitor your Vercel deployments.

### Manual Webhook Setup

1. Go to your Vercel project → **Settings** → **Git**
2. Scroll to **Deploy Hooks**
3. **Name**: "Pinga Notifications"
4. **URL**: `https://your-domain.com/api/webhook/vercel`
5. Click **Add**

**What you'll receive:**

- 🚀 Deployment created
- ✅ Deployment ready
- ❌ Deployment failed
- 🌐 Domain configured
- 📦 Build logs

---

## Stripe

Track payments, subscriptions, and customer events.

### Setup

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://your-domain.com/api/webhook/stripe`
4. **Events to send**: Choose relevant events
5. Copy the **Signing secret** (store in your .env)

**Popular events:**

- 💰 `payment_intent.succeeded`
- ❌ `payment_intent.failed`
- 📅 `customer.subscription.created`
- 🔄 `customer.subscription.updated`
- ⚠️ `invoice.payment_failed`

---

## Linear

Track issues and project updates.

### Setup

1. Go to Linear → **Settings** → **API** → **Webhooks**
2. Click **New webhook**
3. **URL**: `https://your-domain.com/api/webhook/linear`
4. **Events**: Select events to track
5. **Secret**: (optional)

**What you'll receive:**

- 📋 Issue created/updated
- ✅ Issue completed
- 🏷️ Label changes
- 📌 Project updates
- 💬 Comments added

---

## Custom Webhooks

Pinga can receive webhooks from ANY service that supports HTTP POST requests.

### Generic Webhook URL

```
https://your-domain.com/api/webhook/custom?userId=YOUR_USER_ID
```

### Example: Sending a Custom Webhook

```bash
curl -X POST https://your-domain.com/api/webhook/custom?userId=abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "event": "test",
    "data": {
      "message": "Hello from my custom service!"
    }
  }'
```

---

## Filtering by Source

You can configure which sources are allowed to send you notifications:

1. Go to **Settings** → **Preferences**
2. Under **Allowed Sources**, select specific sources
3. Leave empty to allow all sources

For more advanced filtering (per repository, event type, etc.), see the [Filtering Guide](/help/filtering).

---

## Need a Source That's Not Listed?

We're constantly adding new integrations!

- 💬 [Request a source](https://github.com/aevrHQ/pinga-mvp/issues/new?labels=feature)
- 🛠️ [Build your own integration](#custom-webhooks)
- 📧 Email us: support@pinga.app

---

**Next Steps:**

- [Set up webhook filtering](/help/filtering)
- [Configure Telegram groups](/help/telegram-groups)
- [Back to Help Center](/help)
