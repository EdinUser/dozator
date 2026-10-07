import { describe, expect, it, vi } from "vitest";
import { sendPingerVisit } from "../src/tracking/pinger.js";

const storageKey = "pinger:pk_7mlXpTbUKeYz2zXn-pOPAyK2iW389KLso-1ZzZY3fFo:visitor-id";

describe("sendPingerVisit", () => {
  it("does nothing when tracking is not configured", () => {
    const fetchMock = vi.fn();

    sendPingerVisit({ endpoint: "", fetchImpl: fetchMock });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses the build-generated browser configuration by default", () => {
    const endpoint = "https://example.test/api/v1/ping";
    const storage = memoryStorage();
    const fetchMock = vi.fn(() => Promise.resolve());
    const previousEndpoint = globalThis.__DOZATOR_PINGER_ENDPOINT__;

    globalThis.__DOZATOR_PINGER_ENDPOINT__ = endpoint;

    try {
      sendPingerVisit({ storage, createVisitorId: () => "visitor-id", fetchImpl: fetchMock });
    } finally {
      globalThis.__DOZATOR_PINGER_ENDPOINT__ = previousEndpoint;
    }

    expect(fetchMock).toHaveBeenCalledWith(endpoint, expect.any(Object));
  });

  it("stores one random visitor ID and sends the public project key", () => {
    const storage = memoryStorage();
    const fetchMock = vi.fn(() => Promise.resolve());

    sendPingerVisit({
      endpoint: "https://example.test/api/v1/ping",
      storage,
      createVisitorId: () => "550e8400-e29b-41d4-a716-446655440000",
      fetchImpl: fetchMock,
    });

    expect(storage.getItem(storageKey)).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(fetchMock).toHaveBeenCalledWith("https://example.test/api/v1/ping", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        projectKey: "pk_7mlXpTbUKeYz2zXn-pOPAyK2iW389KLso-1ZzZY3fFo",
        visitorId: "550e8400-e29b-41d4-a716-446655440000",
      }),
    }));
  });

  it("reuses the stored visitor ID", () => {
    const storage = memoryStorage();
    storage.setItem(storageKey, "550e8400-e29b-41d4-a716-446655440000");
    const fetchMock = vi.fn(() => Promise.resolve());
    const randomUuid = vi.fn();

    sendPingerVisit({
      endpoint: "https://example.test/api/v1/ping",
      storage,
      createVisitorId: randomUuid,
      fetchImpl: fetchMock,
    });

    expect(randomUuid).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

function memoryStorage() {
  const data = new Map();

  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
}
