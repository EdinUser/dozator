import { describe, expect, it } from "vitest";
import { calculateDilution } from "../src/calculators/dilution.js";
import { calculateDose } from "../src/calculators/dose.js";
import { calculateInfusionDoseRate, calculateInfusionVolumeTime } from "../src/calculators/infusion.js";
import { calculateReconstitution } from "../src/calculators/reconstitution.js";
import { makeCalculationEntry } from "../src/storage/calculation-store.js";

describe("safety regression coverage", () => {
  it.each([
    {
      name: "dose",
      calculate: calculateDose,
      input: {
        requiredDose: "0",
        requiredDoseUnit: "mg",
        availableAmount: "1",
        availableAmountUnit: "mg",
        availableVolume: "1",
        availableVolumeUnit: "mL",
      },
      field: "requiredDose",
    },
    {
      name: "dilution",
      calculate: calculateDilution,
      input: {
        availableAmount: "0",
        availableAmountUnit: "mg",
        availableVolume: "1",
        availableVolumeUnit: "mL",
        targetConcentration: "1",
        targetConcentrationUnit: "mg/mL",
      },
      field: "availableAmount",
    },
    {
      name: "reconstitution",
      calculate: calculateReconstitution,
      input: {
        vialAmount: "-1",
        vialAmountUnit: "g",
        diluentVolume: "10",
        diluentVolumeUnit: "mL",
        finalVolume: "10",
        finalVolumeUnit: "mL",
        requiredDose: "",
        requiredDoseUnit: "mg",
      },
      field: "vialAmount",
    },
    {
      name: "infusion dose rate",
      calculate: calculateInfusionDoseRate,
      input: {
        medicationAmount: "1",
        medicationAmountUnit: "mg",
        finalVolume: "1",
        finalVolumeUnit: "mL",
        prescribedRate: "",
        prescribedRateUnit: "mg/h",
      },
      field: "prescribedRate",
    },
    {
      name: "infusion volume time",
      calculate: calculateInfusionVolumeTime,
      input: {
        volume: "1",
        volumeUnit: "mL",
        time: "0",
        timeUnit: "h",
      },
      field: "time",
    },
  ])("$name returns general and field-specific errors", ({ calculate, input, field }) => {
    const result = calculate(input);

    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.fieldErrors).toEqual([
      expect.objectContaining({
        name: field,
        message: expect.stringContaining("положително число"),
      }),
    ]);
  });

  it("shows all applied conversions in a mixed-unit reconstitution dose", () => {
    const result = calculateReconstitution({
      vialAmount: "1000000",
      vialAmountUnit: "µg",
      diluentVolume: "0.01",
      diluentVolumeUnit: "L",
      finalVolume: "0.01",
      finalVolumeUnit: "L",
      requiredDose: "0.25",
      requiredDoseUnit: "g",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("2.5 mL");
    expect(result.notices).toEqual(["1000000 µg = 1000 mg", "0.01 L = 10 mL", "0.01 L = 10 mL", "0.25 g = 250 mg"]);
    expect(result.traces).toContain("250 mg ÷ 100 mg/mL = 2.5 mL");
  });

  it("does not mutate saved calculation values when creating storage entries", () => {
    const values = { requiredDose: "125", requiredDoseUnit: "mg" };
    const entry = makeCalculationEntry("dose", "125 mg", values);

    values.requiredDose = "999";

    expect(entry.values.requiredDose).toBe("125");
  });
});
