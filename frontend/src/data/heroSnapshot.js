/**
 * Hero orbital carousel snapshot: fixed list of 17 extensions for instant first paint.
 * Icons are served from /hero-icons/{extensionId}.png (static PNGs in public/hero-icons/).
 * No API or DB is required for the hero to render in split seconds.
 */

/** Base URL for static hero icons (same-origin; served by Vite/static host) */
const HERO_ICONS_BASE = "/hero-icons";

/**
 * Returns the URL for a hero extension icon. Use this in the hero carousel only.
 * Browser loads from static folder first; use img onError to fallback to API/placeholder.
 * @param {string} extensionId
 * @returns {string} Path to static PNG, e.g. /hero-icons/session-buddy.png
 */
export function getHeroIconUrl(extensionId) {
  if (!extensionId) return "";
  return `${HERO_ICONS_BASE}/${encodeURIComponent(extensionId)}.png`;
}

/**
 * Snapshot of 17 scanned extensions: names and summary signals for the hero.
 * Matches the extension IDs for which you place PNGs in public/hero-icons/.
 */
export const HERO_SNAPSHOT = [
  { extensionId: "session-buddy", name: "Session Buddy", security: { level: "ok", label: "No critical issues", score: 95 }, privacy: { level: "warn", label: "Trackers detected", score: 72 }, governance: { level: "ok", label: "Standard permissions", score: 94 }, lastAnalyzed: "1m ago" },
  { extensionId: "hover-zoom", name: "Hover Zoom+", security: { level: "ok", label: "Good", score: 93 }, privacy: { level: "ok", label: "No trackers", score: 91 }, governance: { level: "ok", label: "Standard permissions", score: 96 }, lastAnalyzed: "2m ago" },
  { extensionId: "stylus", name: "Stylus", security: { level: "ok", label: "No critical issues", score: 90 }, privacy: { level: "warn", label: "Third-party scripts", score: 70 }, governance: { level: "ok", label: "Standard permissions", score: 95 }, lastAnalyzed: "5m ago" },
  { extensionId: "adblock", name: "Adblock Plus", security: { level: "ok", label: "No critical issues", score: 97 }, privacy: { level: "ok", label: "Minimal data", score: 95 }, governance: { level: "ok", label: "Standard permissions", score: 97 }, lastAnalyzed: "8m ago" },
  { extensionId: "honey", name: "PayPal Honey", security: { level: "warn", label: "Review recommended", score: 72 }, privacy: { level: "warn", label: "Trackers detected", score: 58 }, governance: { level: "ok", label: "Standard permissions", score: 90 }, lastAnalyzed: "12m ago" },
  { extensionId: "grammarly", name: "Grammarly", security: { level: "ok", label: "No critical issues", score: 96 }, privacy: { level: "warn", label: "Data collection", score: 65 }, governance: { level: "ok", label: "Standard permissions", score: 94 }, lastAnalyzed: "15m ago" },
  { extensionId: "hola", name: "Hola VPN", security: { level: "warn", label: "Review recommended", score: 55 }, privacy: { level: "warn", label: "Trackers detected", score: 48 }, governance: { level: "warn", label: "Broad permissions", score: 60 }, lastAnalyzed: "20m ago" },
  { extensionId: "vdh", name: "Video DownloadHelper", security: { level: "ok", label: "No critical issues", score: 94 }, privacy: { level: "ok", label: "No trackers", score: 92 }, governance: { level: "ok", label: "Standard permissions", score: 95 }, lastAnalyzed: "25m ago" },
  { extensionId: "ublock", name: "uBlock Origin", security: { level: "ok", label: "No critical issues", score: 98 }, privacy: { level: "ok", label: "Minimal data", score: 96 }, governance: { level: "ok", label: "Standard permissions", score: 98 }, lastAnalyzed: "30m ago" },
  { extensionId: "lastpass", name: "LastPass", security: { level: "warn", label: "Review recommended", score: 78 }, privacy: { level: "warn", label: "Data collection", score: 62 }, governance: { level: "ok", label: "Standard permissions", score: 88 }, lastAnalyzed: "35m ago" },
  { extensionId: "react-devtools", name: "React DevTools", security: { level: "ok", label: "No critical issues", score: 92 }, privacy: { level: "ok", label: "No trackers", score: 95 }, governance: { level: "ok", label: "Standard permissions", score: 94 }, lastAnalyzed: "40m ago" },
  { extensionId: "json-viewer", name: "JSON Viewer", security: { level: "ok", label: "No critical issues", score: 91 }, privacy: { level: "ok", label: "No trackers", score: 93 }, governance: { level: "ok", label: "Standard permissions", score: 92 }, lastAnalyzed: "45m ago" },
  { extensionId: "bitwarden", name: "Bitwarden", security: { level: "ok", label: "No critical issues", score: 96 }, privacy: { level: "ok", label: "Minimal data", score: 94 }, governance: { level: "ok", label: "Standard permissions", score: 97 }, lastAnalyzed: "50m ago" },
  { extensionId: "dark-reader", name: "Dark Reader", security: { level: "ok", label: "No critical issues", score: 93 }, privacy: { level: "ok", label: "No trackers", score: 92 }, governance: { level: "ok", label: "Standard permissions", score: 95 }, lastAnalyzed: "55m ago" },
  { extensionId: "webde", name: "WEB.DE", security: { level: "ok", label: "Good", score: 88 }, privacy: { level: "warn", label: "Third-party scripts", score: 75 }, governance: { level: "ok", label: "Standard permissions", score: 90 }, lastAnalyzed: "1h ago" },
  { extensionId: "tampermonkey", name: "Tampermonkey", security: { level: "ok", label: "No critical issues", score: 90 }, privacy: { level: "warn", label: "Script injection", score: 68 }, governance: { level: "ok", label: "Standard permissions", score: 92 }, lastAnalyzed: "1h ago" },
  { extensionId: "https-everywhere", name: "HTTPS Everywhere", security: { level: "ok", label: "No critical issues", score: 97 }, privacy: { level: "ok", label: "No trackers", score: 96 }, governance: { level: "ok", label: "Standard permissions", score: 98 }, lastAnalyzed: "1h ago" },
];
