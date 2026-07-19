export function registerServiceWorker({ enabled = import.meta.env.PROD } = {}) {
  if (!enabled || !("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(() => navigator.serviceWorker.ready)
      .then((registration) => {
        if (registration.active) {
          registration.active.postMessage({ type: "CACHE_URLS", urls: currentPageResourceUrls() });
        }
      })
      .catch(() => null);
  });
}

export function currentPageResourceUrls(entries = performance.getEntriesByType("resource")) {
  return [
    window.location.origin + "/",
    ...entries
      .map((entry) => entry.name)
      .filter((url) => {
        try {
          return new URL(url).origin === window.location.origin;
        } catch {
          return false;
        }
      }),
  ];
}
