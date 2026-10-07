import { writeFile } from "node:fs/promises";

const endpoint = process.env.VITE_PINGER_ENDPOINT;

if (!endpoint) {
  throw new Error("VITE_PINGER_ENDPOINT must be configured for production builds.");
}

const endpointUrl = new URL(endpoint);

if (!['http:', 'https:'].includes(endpointUrl.protocol)) {
  throw new Error("VITE_PINGER_ENDPOINT must use HTTP or HTTPS.");
}

await writeFile(
  new URL("../public/pinger-config.js", import.meta.url),
  `globalThis.__DOZATOR_PINGER_ENDPOINT__ = ${JSON.stringify(endpoint)};\n`,
);
