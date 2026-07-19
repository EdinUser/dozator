import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { currentPageResourceUrls } from "../src/pwa/register-service-worker.js";

describe("PWA assets", () => {
  it("defines an installable web app manifest", () => {
    const manifest = JSON.parse(fs.readFileSync("public/manifest.webmanifest", "utf8"));

    expect(manifest.name).toBe("Дозатор");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.icons.map((icon) => icon.sizes)).toContain("192x192");
    expect(manifest.icons.map((icon) => icon.sizes)).toContain("512x512");
  });

  it("ships a service worker with versioned cache and offline fallback", () => {
    const serviceWorker = fs.readFileSync("public/service-worker.js", "utf8");

    expect(serviceWorker).toContain("dozator-${appVersion}");
    expect(serviceWorker).toContain('self.addEventListener("install"');
    expect(serviceWorker).toContain('self.addEventListener("fetch"');
    expect(serviceWorker).toContain("networkFirst(event.request, \"/\")");
  });
});

describe("service worker registration helpers", () => {
  it("collects only same-origin resource URLs for runtime caching", () => {
    const originalWindow = globalThis.window;

    globalThis.window = {
      location: {
        origin: "https://dozator.test",
      },
    };

    expect(
      currentPageResourceUrls([
        { name: "https://dozator.test/assets/index.js" },
        { name: "https://cdn.example.test/asset.js" },
        { name: "not a url" },
      ]),
    ).toEqual(["https://dozator.test/", "https://dozator.test/assets/index.js"]);

    globalThis.window = originalWindow;
  });
});
