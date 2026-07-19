import { describe, expect, it } from "vitest";
import { readSharedCalculation, shareableValues } from "../src/share/share-link.js";

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

  it("keeps only structured calculator fields in share data", () => {
    expect(
      shareableValues("reconstitution", {
        vialAmount: "1",
        vialAmountUnit: "g",
        diluent: "patient name must not be shared",
        note: "diagnosis must not be shared",
      }),
    ).toEqual({
      vialAmount: "1",
      vialAmountUnit: "g",
    });
  });

  it("removes extra fields from decoded URL payloads", () => {
    const payload = {
      v: 1,
      calculator: "dilution",
      values: {
        availableAmount: "10",
        availableAmountUnit: "mg",
        diluent: "free text",
        patientName: "not allowed",
      },
    };
    const hash = `#calc=${btoa(encodeURIComponent(JSON.stringify(payload)))}`;

    expect(readSharedCalculation(hash)).toEqual({
      v: 1,
      calculator: "dilution",
      values: {
        availableAmount: "10",
        availableAmountUnit: "mg",
      },
    });
  });

  it("ignores invalid hashes", () => {
    expect(readSharedCalculation("#not-calc=abc")).toBeNull();
    expect(readSharedCalculation("#calc=not-valid")).toBeNull();
  });
});
