// Shared ntfy push helper. Reads NTFY_URL or NTFY_TOPIC_URL and posts a
// prioritized notification to the dispatch channel. Fire-and-forget:
// callers can await it or not; either way a failure never throws.

type NtfyOpts = {
  title: string;
  body: string;
  tags?: string;
  priority?: "min" | "low" | "default" | "high" | "urgent";
  // URL opened when the notification is tapped (ntfy Click header).
  click?: string;
  // Action buttons shown on the notification, e.g. a "Claim trip" link.
  actions?: { label: string; url: string }[];
};

export async function ntfyPush(opts: NtfyOpts): Promise<void> {
  const url = process.env.NTFY_URL || process.env.NTFY_TOPIC_URL;
  if (!url) return;
  try {
    const headers: Record<string, string> = {
      Title: opts.title,
      Priority: opts.priority ?? "high",
      Tags: opts.tags ?? "sparkles",
    };
    if (opts.click) headers.Click = opts.click;
    if (opts.actions?.length) {
      headers.Actions = opts.actions
        .slice(0, 3) // ntfy caps actions at 3
        .map((a) => `view, ${a.label.replace(/,/g, " ")}, ${a.url}`)
        .join("; ");
    }
    await fetch(url, {
      method: "POST",
      headers,
      body: opts.body,
    });
  } catch {
    // swallow — dispatch push is best-effort
  }
}
