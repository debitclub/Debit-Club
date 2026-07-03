// api/chat.js
// Serverless function (Vercel). Keeps the Anthropic API key server-side.
// The frontend calls POST /api/chat with { system, messages } and never
// sees the key.

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 1000;
const MAX_MESSAGES = 40; // simple guard against runaway threads

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Server is missing ANTHROPIC_API_KEY. Set it in your deployment's environment variables."
    });
  }

  const { system, messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Request must include a non-empty messages array." });
  }
  if (messages.length > MAX_MESSAGES) {
    return res.status(400).json({ error: "Thread too long. Please clear the thread and start again." });
  }
  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") {
      return res.status(400).json({ error: "Each message needs a valid role and string content." });
    }
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: typeof system === "string" ? system : undefined,
        messages
      })
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: data?.error?.message || "Anthropic API returned an error."
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Could not reach Anthropic API: " + err.message });
  }
}
