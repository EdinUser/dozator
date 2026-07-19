import { describe, expect, it } from "vitest";
import { readSharedCalculation } from "../src/share/share-link.js";

describe("share links", () => {
  it("decodes a shared calculation from the URL hash", () => {
    const payload = {
      v: 1,
      calculator: "dose",
      values: {
        requiredDose: "125",
        requiredDoseUnit: "mg",
      },
    };
    const hash = `#calc=${btoa(encodeURIComponent(JSON.stringify(payload)))}`;

    expect(readSharedCalculation(hash)).toEqual(payload);
  });

  it("ignores invalid hashes", () => {
    expect(readSharedCalculation("#not-calc=abc")).toBeNull();
    expect(readSharedCalculation("#calc=not-valid")).toBeNull();
  });
});
