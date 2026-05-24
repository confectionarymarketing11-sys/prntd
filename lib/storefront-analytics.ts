"use client";

export type StorefrontEventType = "page_view" | "added_to_cart" | "reached_checkout" | "checkout_completed";

const VISITOR_KEY = "prntd_visitor_id";
const SESSION_KEY = "prntd_session_id";
const SESSION_STARTED_KEY = "prntd_session_started_at";
const SESSION_TTL_MS = 30 * 60 * 1000;

function makeId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function getStorefrontAnalyticsIdentity() {
  const now = Date.now();
  let visitorId = window.localStorage.getItem(VISITOR_KEY);
  let sessionId = window.sessionStorage.getItem(SESSION_KEY);
  const sessionStartedAt = Number(window.sessionStorage.getItem(SESSION_STARTED_KEY) ?? 0);

  if (!visitorId) {
    visitorId = makeId("visitor");
    window.localStorage.setItem(VISITOR_KEY, visitorId);
  }

  if (!sessionId || !sessionStartedAt || now - sessionStartedAt > SESSION_TTL_MS) {
    sessionId = makeId("session");
    window.sessionStorage.setItem(SESSION_KEY, sessionId);
    window.sessionStorage.setItem(SESSION_STARTED_KEY, String(now));
  }

  return {
    visitorId,
    sessionId,
  };
}

export function trackStorefrontEvent(eventType: StorefrontEventType, metadata: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  const identity = getStorefrontAnalyticsIdentity();
  const payload = {
    eventType,
    ...identity,
    pathname: window.location.pathname,
    referrer: document.referrer,
    metadata,
  };
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/track", blob);
    return;
  }

  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
