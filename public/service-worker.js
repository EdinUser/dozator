const appVersion = "0.5.0";
const cacheName = `dozator-${appVersion}`;
const appShell = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/favicon.svg",
  "/icons/favicon-16x16.png",
  "/icons/favicon-32x32.png",
  "/icons/apple-touch-icon.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(cacheAppShell().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("dozator-") && key !== cacheName).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_URLS" || !Array.isArray(event.data.urls)) {
    return;
  }

  event.waitUntil(
    caches.open(cacheName).then((cache) =>
      Promise.all(
        event.data.urls
          .filter((url) => isSameOriginGettable(url))
          .map((url) => cache.add(url).catch(() => null)),
      ),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request, "/"));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});

async function cacheFirst(request) {
  const cached = await matchCachedRequest(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  const cache = await caches.open(cacheName);
  cache.put(request, response.clone());

  return response;
}

async function cacheAppShell() {
  const cache = await caches.open(cacheName);
  await cache.addAll(appShell);

  const indexResponse = await fetch("/index.html", { cache: "reload" });

  if (!indexResponse.ok) {
    return;
  }

  const html = await indexResponse.clone().text();
  await cache.put("/", indexResponse.clone());
  await cache.put("/index.html", indexResponse.clone());

  await Promise.all(extractSameOriginAssetUrls(html).map((url) => cache.add(url).catch(() => null)));
}

async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());

    return response;
  } catch {
    return matchCachedRequest(request).then((cached) => cached || caches.match(fallbackUrl));
  }
}

async function matchCachedRequest(request) {
  return caches.match(request).then((cached) => cached || caches.match(new URL(request.url).pathname));
}

function isSameOriginGettable(url) {
  try {
    return new URL(url, self.location.origin).origin === self.location.origin;
  } catch {
    return false;
  }
}

function extractSameOriginAssetUrls(html) {
  return [
    ...new Set(
      [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
        .map((match) => match[1])
        .filter((url) => url.startsWith("/") && !url.startsWith("//")),
    ),
  ];
}
