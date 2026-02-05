// Privacy-first analytics (no PII).
// Posts a single pageview event per route entry and fails silently if the API is down.

let lastPathSent = null;
let lastSentAt = 0;

const MIN_INTERVAL_MS = 250;

export async function trackPageView(pathname) {
  try {
    const path = (pathname || "/").trim() || "/";

    const now = Date.now();
    if (lastPathSent === path && now - lastSentAt < MIN_INTERVAL_MS) return;

    lastPathSent = path;
    lastSentAt = now;

    // Use relative URL; Vite proxy routes /api to the backend in dev.
    await fetch("/api/telemetry/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
      keepalive: true,
    });
  } catch {
    // Fail silently (do not break UI)
  }
}


