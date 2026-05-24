// Service Worker for 中级财务管理智能学习平台
// Enables offline access and fast loading

const CACHE_NAME = "finance-exam-v1";
const API_CACHE = "finance-exam-api-v1";

// Core assets to precache
const PRECACHE = [
  "/",
  "/home",
  "/framework",
  "/practice",
  "/analysis",
  "/search",
  "/admin",
  "/manifest.json",
];

// API endpoints to cache for offline use
const API_ROUTES = [
  "/api/stats",
  "/api/framework",
  "/api/guides",
];

// Install: precache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for API, network-first for pages
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const { pathname } = url;

  // Skip non-GET and chrome-extension
  if (event.request.method !== "GET") return;
  if (url.protocol === "chrome-extension:") return;

  // API routes: cache-first then network update
  if (pathname.startsWith("/api/")) {
    event.respondWith(apiCacheStrategy(event.request));
    return;
  }

  // Static assets and pages: network-first with cache fallback
  event.respondWith(networkFirstStrategy(event.request));
});

// Cache-first for API: return cached instantly, update in background
async function apiCacheStrategy(request) {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(request);

  // Update cache in background
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  // Return cached immediately if available
  if (cached) {
    fetchPromise; // fire and forget update
    return cached;
  }

  // No cache: must wait for network
  try {
    const response = await fetchPromise;
    return response;
  } catch {
    return new Response(
      JSON.stringify({ error: "离线状态，暂无缓存数据" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Network-first: try network, fallback to cache
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    // Cache successful page loads
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Offline fallback page
    const fallback = await caches.match("/home");
    if (fallback) return fallback;

    return new Response("离线状态，请连接网络", {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
