# Render Integration Guide

Learn how to receive deployment notifications from Render in Pinga.

---

## Why use Email Forwarding?

Render currently supports detailed webhooks for job failures but not generic "Deployment Succeeded" events for all service types in a standard format that fits everyone.

The most reliable way to get **instant** notifications for ANY Render event (Deployments, Service Status, billing) is to forward their notification emails to Pinga.

## Step 1: Get Your Pinga Webhook URL

1. Go to your **Pinga Dashboard** → **Settings**.
2. Look for the **Developer Information** section.
3. Copy your **Render / Custom Webhook URL**.

It should look like this:
`https://pinga.app/api/webhook/render?userId=YOUR_USER_ID`

---

## Step 2: Set up Email Forwarding (Gmail Users)

We will use a simple Google Apps Script to check for emails from Render and forward them to Pinga.

1. Go to [Google Apps Script](https://script.google.com/) and create a **New Project**.
2. Name it "Render to Pinga".
3. Replace the code in `Code.gs` with the following:

```javascript
// Paste your Pinga Webhook URL here
const WEBHOOK_URL = "https://pinga.app/api/webhook/render?userId=YOUR_USER_ID";

function processRenderEmails() {
  // Find unread emails from Render
  const threads = GmailApp.search(
    "from:notify@render.com is:unread time_newer_than:1h",
  );

  threads.forEach((thread) => {
    const messages = thread.getMessages();
    messages.forEach((message) => {
      if (message.isUnread()) {
        const subject = message.getSubject();
        const body = message.getPlainBody();
        const date = message.getDate();

        // Send to Pinga
        const payload = {
          subject: subject,
          body: body,
          date: date,
          source: "render",
        };

        try {
          UrlFetchApp.fetch(WEBHOOK_URL, {
            method: "post",
            contentType: "application/json",
            payload: JSON.stringify(payload),
          });

          console.log("Forwarded: " + subject);

          // Mark as read so we don't send it again
          message.markRead();

          // Optional: Archive it
          // thread.moveToArchive();
        } catch (e) {
          console.error("Failed to forward: " + e);
        }
      }
    });
  });
}
```

4. **Replace `WEBHOOK_URL`** with the URL you copied in Step 1.
5. Save the project (Floppy disk icon).

---

## Step 3: Automate the Script

To make sure it runs automatically:

1. In the Apps Script editor, click on **Triggers** (Alarm clock icon on the left).
2. Click **+ Add Trigger** (bottom right).
3. Configure it as follows:
   - **Choose which function to run**: `processRenderEmails`
   - **Select event source**: `Time-driven`
   - **Select type of time based trigger**: `Minutes timer`
   - **Select minute interval**: `Every minute`
4. Click **Save**.
5. You will be asked to grant permissions. Click **Review Permissions**, choose your account, and allow access to Gmail (Proceed to unsafe if warned - it's your own script).

---

## Step 4: Test It

1. Trigger a manual deploy in Render (or wait for one).
2. Wait 1-2 minutes.
3. Check your Telegram/Discord channel connected to Pinga.
4. You should see a notification! 🎉

> **Tip:** Make sure your user preferences in Pinga allow "Render" as a source (or allow all sources).

---

## Troubleshooting

- **No notifications?**
  - Check your Google Apps Script "Executions" tab to see if it ran and if there were errors.
  - Check your "Spam" folder to ensure Render emails aren't going there.
  - Verify your User ID in the Webhook URL is correct.

- **Duplicate notifications?**
  - The script checks for `is:unread` and marks them as read. If you read the email manually before the script runs, it won't forward it.

---

[Back to Help Center](/help)
