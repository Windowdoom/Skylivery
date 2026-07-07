// Shared ntfy push helper. Reads NTFY_URL or NTFY_TOPIC_URL and posts a
// prioritized notification to the dispatch channel. Fire-and-forget:
// callers can await it or not; either way a failure never throws.

type NtfyOpts = {
  title: string;
  body: string;
  tags?: string;
  priority?: "min" | "low" | "default" | "high" | "urgent";
};

export async function ntfyPush(opts: NtfyOpts): Promise<void> {
  const url = process.env.NTFY_URL || process.env.NTFY_TOPIC_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        Title: opts.title,
        Priority: opts.priority ?? "high",
        Tags: opts.tags ?? "sparkles",
      },
      body: opts.body,
    });
  } catch {
    // swallow — dispatch push is best-effort
  }
}
