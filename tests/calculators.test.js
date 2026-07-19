import { describe, expect, it } from "vitest";
import { calculateDilution } from "../src/calculators/dilution.js";
import { calculateDose } from "../src/calculators/dose.js";
import { calculateInfusionDoseRate, calculateInfusionVolumeTime } from "../src/calculators/infusion.js";
import { calculateReconstitution } from "../src/calculators/reconstitution.js";

describe("dose calculator", () => {
  it("calculates volume to withdraw from a prepared solution", () => {
    const result = calculateDose({
      requiredDose: "125",
      requiredDoseUnit: "mg",
      availableAmount: "250",
      availableAmountUnit: "mg",
      availableVolume: "5",
      availableVolumeUnit: "mL",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("2.5 mL");
    expect(result.label.recipe).toContain("2.5 mL");
  });

  it("accepts comma decimals from mobile keyboards", () => {
    const result = calculateDose({
      requiredDose: "0,5",
      requiredDoseUnit: "mg",
      availableAmount: "1",
      availableAmountUnit: "mg",
      availableVolume: "1",
      availableVolumeUnit: "mL",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("0.5 mL");
  });

  it("rejects non-numeric input", () => {
    const result = calculateDose({
      requiredDose: "1..5",
      requiredDoseUnit: "mg",
      availableAmount: "1",
      availableAmountUnit: "mg",
      availableVolume: "1",
      availableVolumeUnit: "mL",
      highAlert: false,
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]).toContain("положително число");
  });

  it("shows conversion notices when mass units differ", () => {
    const result = calculateDose({
      requiredDose: "250",
      requiredDoseUnit: "µg",
      availableAmount: "1",
      availableAmountUnit: "mg",
      availableVolume: "1",
      availableVolumeUnit: "mL",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("0.25 mL");
    expect(result.notices).toContain("250 µg = 0.25 mg");
  });
});

describe("dilution calculator", () => {
  it("calculates medication and diluent volumes", () => {
    const result = calculateDilution({
      availableAmount: "10",
      availableAmountUnit: "mg",
      availableVolume: "1",
      availableVolumeUnit: "mL",
      targetAmount: "2",
      targetAmountUnit: "mg",
      targetVolume: "1",
      targetVolumeUnit: "mL",
      finalVolume: "20",
      finalVolumeUnit: "mL",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("4 mL");
    expect(result.instructions).toContain("Добавете 16 mL от посочения разтворител.");
  });

  it("rejects target concentration above available concentration", () => {
    const result = calculateDilution({
      availableAmount: "2",
      availableAmountUnit: "mg",
      availableVolume: "1",
      availableVolumeUnit: "mL",
      targetAmount: "10",
      targetAmountUnit: "mg",
      targetVolume: "1",
      targetVolumeUnit: "mL",
      finalVolume: "20",
      finalVolumeUnit: "mL",
      highAlert: false,
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]).toContain("по-висока");
    expect(result.fieldErrors.map((field) => field.name)).toEqual(["targetAmount", "targetVolume"]);
  });

  it("shows conversion notices for concentration units", () => {
    const result = calculateDilution({
      availableAmount: "1",
      availableAmountUnit: "mg",
      availableVolume: "1",
      availableVolumeUnit: "mL",
      targetAmount: "100",
      targetAmountUnit: "µg",
      targetVolume: "1",
      targetVolumeUnit: "mL",
      finalVolume: "20",
      finalVolumeUnit: "mL",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("2 mL");
    expect(result.notices).toContain("100 µg = 0.1 mg");
  });
});

describe("reconstitution calculator", () => {
  it("calculates resulting concentration and optional dose withdrawal", () => {
    const result = calculateReconstitution({
      vialAmount: "1",
      vialAmountUnit: "g",
      diluentVolume: "10",
      diluentVolumeUnit: "mL",
      finalVolume: "10",
      finalVolumeUnit: "mL",
      requiredDose: "350",
      requiredDoseUnit: "mg",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.finalLines).toContain("Концентрация: 100 mg/mL");
    expect(result.primary).toBe("3.5 mL");
  });
});

describe("infusion calculators", () => {
  it("calculates pump rate from medication amount and prescribed mg per hour", () => {
    const result = calculateInfusionDoseRate({
      medicationAmount: "500",
      medicationAmountUnit: "mg",
      finalVolume: "250",
      finalVolumeUnit: "mL",
      prescribedRate: "25",
      prescribedRateUnit: "mg/h",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("12.5 mL/h");
  });

  it("calculates pump rate from volume and time", () => {
    const result = calculateInfusionVolumeTime({
      volume: "500",
      volumeUnit: "mL",
      time: "4",
      timeUnit: "h",
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("125 mL/h");
  });
});
