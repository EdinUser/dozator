const projectKey = "pk_7mlXpTbUKeYz2zXn-pOPAyK2iW389KLso-1ZzZY3fFo";
const visitorIdStorageKey = `pinger:${projectKey}:visitor-id`;

export function sendPingerVisit({
  endpoint = import.meta.env.VITE_PINGER_ENDPOINT,
  storage,
  createVisitorId,
  fetchImpl,
} = {}) {
  if (!endpoint) {
    return;
  }

  const browserStorage = storage ?? localStorage;
  const createId = createVisitorId ?? (() => crypto.randomUUID());
  const sendRequest = fetchImpl ?? fetch;
  let visitorId = browserStorage.getItem(visitorIdStorageKey);

  if (!visitorId) {
    visitorId = createId();
    browserStorage.setItem(visitorIdStorageKey, visitorId);
  }

  sendRequest(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectKey, visitorId }),
    keepalive: true,
  }).catch(() => {});
}
