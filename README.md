# Debit Club — deploy guide

This folder has everything you need:

```
index.html      ← the app (frontend)
api/chat.js     ← serverless function that calls Anthropic, holds your API key
package.json    ← lets Vercel recognize this as a Node project
```

The frontend never talks to Anthropic directly. It calls `/api/chat` on
your own domain, and that serverless function (running on Vercel's servers,
not in the user's browser) attaches your API key and forwards the request.
Your key is never exposed to site visitors.

## 1. Get an Anthropic API key

1. Go to https://console.anthropic.com
2. Create an account (separate from your Claude.ai login — this is the
   developer/API side, billed separately, pay-as-you-go)
3. Go to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`). You won't be able to see it
   again, so save it somewhere safe for now.
5. Add a small amount of credit to the account (Settings → Billing) —
   without credit, requests will fail even with a valid key.

## 2. Deploy to Vercel

**Easiest path — no command line:**

1. Go to https://vercel.com and sign up / log in (GitHub login is easiest)
2. Push this folder to a new GitHub repo (or use Vercel's "Import" and
   drag-and-drop the folder if it offers that option)
3. In Vercel, click **Add New → Project**, and import that repo
4. Before deploying, open **Environment Variables** and add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: the `sk-ant-...` key from step 1
5. Click **Deploy**

**Command-line path**, if you have Node/npm installed:

```bash
npm install -g vercel
cd ledger-app
vercel
# follow the prompts to create a new project
vercel env add ANTHROPIC_API_KEY
# paste your key when prompted
vercel --prod
```

Either way, Vercel will give you a live URL like
`https://debit-club.vercel.app` — that's your public app.

## 3. Costs to know about

- Vercel's free tier covers this kind of app easily.
- Anthropic API usage is billed per token, separate from any Claude.ai
  subscription. This app is capped at 1000 output tokens per reply and a
  40-message thread limit as a basic safeguard, but if it gets real public
  traffic, keep an eye on usage in the Anthropic console and consider adding
  rate limiting per visitor (e.g. via Vercel's edge middleware or a service
  like Upstash) before sharing it widely.

## 4. Testing locally (optional)

```bash
npm install -g vercel
cd ledger-app
vercel dev
```

This runs the app on `localhost` with the serverless function working
locally too (it'll prompt you to link env vars).
