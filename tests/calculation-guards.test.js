import { describe, expect, it } from "vitest";
import { calculateDilution } from "../src/calculators/dilution.js";
import { calculateDose } from "../src/calculators/dose.js";
import { calculateInfusionDoseRate, calculateInfusionVolumeTime } from "../src/calculators/infusion.js";
import { calculateReconstitution } from "../src/calculators/reconstitution.js";

describe("dose calculation guards", () => {
  it("converts g and L while calculating withdraw volume", () => {
    const result = calculateDose({
      requiredDose: "0.5",
      requiredDoseUnit: "g",
      availableAmount: "1",
      availableAmountUnit: "g",
      availableVolume: "0.5",
      availableVolumeUnit: "L",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("250 mL");
    expect(result.notices).toEqual(["0.5 g = 500 mg", "1 g = 1000 mg", "0.5 L = 500 mL"]);
    expect(result.traces).toContain("500 mg ÷ 2 mg/mL = 250 mL");
  });

  it("warns when calculated withdraw volume is below 0.1 mL", () => {
    const result = calculateDose({
      requiredDose: "50",
      requiredDoseUnit: "µg",
      availableAmount: "10",
      availableAmountUnit: "mg",
      availableVolume: "1",
      availableVolumeUnit: "mL",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("0.005 mL");
    expect(result.warnings).toContain("Изчисленият обем е под 0.1 mL и може да не бъде измерим точно с избраната спринцовка.");
  });

  it("adds high-alert warning without changing the arithmetic", () => {
    const result = calculateDose({
      requiredDose: "1",
      requiredDoseUnit: "mg",
      availableAmount: "1",
      availableAmountUnit: "mg",
      availableVolume: "1",
      availableVolumeUnit: "mL",
      highAlert: true,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("1 mL");
    expect(result.warnings[0]).toContain("Високорисков медикамент");
  });

  it.each(["0", "-1", "", " "])("rejects invalid required dose %s", (requiredDose) => {
    const result = calculateDose({
      requiredDose,
      requiredDoseUnit: "mg",
      availableAmount: "1",
      availableAmountUnit: "mg",
      availableVolume: "1",
      availableVolumeUnit: "mL",
      highAlert: false,
    });

    expect(result.ok).toBe(false);
    expect(result.fieldErrors[0]).toMatchObject({ name: "requiredDose" });
  });
});

describe("dilution calculation guards", () => {
  it("handles direct concentration unit conversions", () => {
    const result = calculateDilution({
      mode: "prepareFinalVolume",
      availableConcentration: "1",
      availableConcentrationUnit: "%",
      targetConcentration: "500",
      targetConcentrationUnit: "µg/mL",
      finalVolume: "0.02",
      finalVolumeUnit: "L",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("1 mL");
    expect(result.instructions).toContain("Добавете 19 mL от посочения разтворител.");
    expect(result.notices).toEqual(["1 % = 10 mg/mL", "500 µg/mL = 0.5 mg/mL", "0.02 L = 20 mL"]);
    expect(result.traces).toContain("500 µg/mL × 20 mL = 10 mg");
    expect(result.traces).toContain("10 mg ÷ 10 mg/mL = 1 mL");
  });

  it("allows no-diluent case when target equals available concentration", () => {
    const result = calculateDilution({
      mode: "prepareFinalVolume",
      availableConcentration: "2",
      availableConcentrationUnit: "mg/mL",
      targetConcentration: "2",
      targetConcentrationUnit: "mg/mL",
      finalVolume: "10",
      finalVolumeUnit: "mL",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("10 mL");
    expect(result.instructions).toContain("Добавете 0 mL от посочения разтворител.");
  });

  it("calculates final volume from a stock volume", () => {
    const result = calculateDilution({
      mode: "diluteAvailableAmount",
      availableConcentration: "10",
      availableConcentrationUnit: "mg/mL",
      targetConcentration: "2",
      targetConcentrationUnit: "mg/mL",
      stockVolume: "0.004",
      stockVolumeUnit: "L",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("20 mL");
    expect(result.instructions).toContain("Добавете 16 mL от посочения разтворител.");
    expect(result.notices).toEqual(["0.004 L = 4 mL"]);
    expect(result.traces).toContain("10 mg/mL × 4 mL = 40 mg");
    expect(result.traces).toContain("40 mg ÷ 2 mg/mL = 20 mL");
  });

  it.each([
    ["availableConcentration", "0"],
    ["targetConcentration", "0"],
    ["finalVolume", "0"],
  ])("rejects invalid %s", (field, value) => {
    const input = {
      mode: "prepareFinalVolume",
      availableConcentration: "1",
      availableConcentrationUnit: "mg/mL",
      targetConcentration: "1",
      targetConcentrationUnit: "mg/mL",
      finalVolume: "1",
      finalVolumeUnit: "mL",
      highAlert: false,
    };

    const result = calculateDilution({ ...input, [field]: value });
    expect(result.ok).toBe(false);
    expect(result.fieldErrors[0]).toMatchObject({ name: field });
  });

  it("rejects invalid stock volume in dilute available amount mode", () => {
    const result = calculateDilution({
      mode: "diluteAvailableAmount",
      availableConcentration: "1",
      availableConcentrationUnit: "mg/mL",
      targetConcentration: "1",
      targetConcentrationUnit: "mg/mL",
      stockVolume: "0",
      stockVolumeUnit: "mL",
      highAlert: false,
    });

    expect(result.ok).toBe(false);
    expect(result.fieldErrors[0]).toMatchObject({ name: "stockVolume" });
  });
});

describe("reconstitution calculation guards", () => {
  it("calculates concentration without optional dose", () => {
    const result = calculateReconstitution({
      vialAmount: "1",
      vialAmountUnit: "g",
      diluentVolume: "10",
      diluentVolumeUnit: "mL",
      finalVolume: "10",
      finalVolumeUnit: "mL",
      requiredDose: "",
      requiredDoseUnit: "mg",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("100 mg/mL");
    expect(result.traces).toEqual(["1 g ÷ 10 mL = 100 mg/mL"]);
  });

  it("treats whitespace optional dose as omitted", () => {
    const result = calculateReconstitution({
      vialAmount: "1",
      vialAmountUnit: "g",
      diluentVolume: "10",
      diluentVolumeUnit: "mL",
      finalVolume: "10",
      finalVolumeUnit: "mL",
      requiredDose: " ",
      requiredDoseUnit: "mg",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("100 mg/mL");
  });

  it("uses manufacturer final volume instead of assuming added diluent volume", () => {
    const result = calculateReconstitution({
      vialAmount: "1",
      vialAmountUnit: "g",
      diluentVolume: "9.6",
      diluentVolumeUnit: "mL",
      finalVolume: "10",
      finalVolumeUnit: "mL",
      requiredDose: "250",
      requiredDoseUnit: "mg",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("2.5 mL");
    expect(result.instructions).toContain("Добавете 9.6 mL от посочения разтворител към флакона.");
    expect(result.instructions).toContain("Използвайте крайния разтворен обем от инструкцията: 10 mL.");
  });

  it("warns when optional dose withdrawal is below 0.1 mL", () => {
    const result = calculateReconstitution({
      vialAmount: "1",
      vialAmountUnit: "g",
      diluentVolume: "10",
      diluentVolumeUnit: "mL",
      finalVolume: "10",
      finalVolumeUnit: "mL",
      requiredDose: "5",
      requiredDoseUnit: "mg",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("0.05 mL");
    expect(result.warnings).toContain("Изчисленият обем е под 0.1 mL и може да не бъде измерим точно с избраната спринцовка.");
  });
});

describe("infusion calculation guards", () => {
  it("converts microgram per hour dose rate to mg per hour", () => {
    const result = calculateInfusionDoseRate({
      medicationAmount: "1",
      medicationAmountUnit: "g",
      finalVolume: "0.5",
      finalVolumeUnit: "L",
      patientWeight: "",
      patientWeightUnit: "kg",
      prescribedRate: "50000",
      prescribedRateUnit: "µg/h",
      hoursToRun: "",
      hoursToRunUnit: "h",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("25 mL/h");
    expect(result.notices).toEqual(["1 g = 1000 mg", "0.5 L = 500 mL", "50000 µg/h = 50 mg/h"]);
    expect(result.traces).toContain("50 mg/h ÷ 2 mg/mL = 25 mL/h");
  });

  it("converts minutes to hours for volume/time rate", () => {
    const result = calculateInfusionVolumeTime({
      volume: "250",
      volumeUnit: "mL",
      time: "30",
      timeUnit: "min",
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("500 mL/h");
    expect(result.notices).toEqual(["30 min = 0.5 h"]);
    expect(result.traces).toEqual(["250 mL ÷ 0.5 h = 500 mL/h"]);
  });

  it.each([
    ["medicationAmount", "0"],
    ["finalVolume", "0"],
    ["prescribedRate", "0"],
  ])("rejects invalid dose-rate field %s", (field, value) => {
    const input = {
      medicationAmount: "1",
      medicationAmountUnit: "mg",
      finalVolume: "1",
      finalVolumeUnit: "mL",
      patientWeight: "",
      patientWeightUnit: "kg",
      prescribedRate: "1",
      prescribedRateUnit: "mg/h",
      hoursToRun: "",
      hoursToRunUnit: "h",
      highAlert: false,
    };

    expect(calculateInfusionDoseRate({ ...input, [field]: value }).ok).toBe(false);
  });

  it("requires patient weight for weight-based dose-rate units", () => {
    const result = calculateInfusionDoseRate({
      medicationAmount: "250",
      medicationAmountUnit: "mg",
      finalVolume: "50",
      finalVolumeUnit: "mL",
      patientWeight: "",
      patientWeightUnit: "kg",
      prescribedRate: "5",
      prescribedRateUnit: "µg/kg/min",
      hoursToRun: "",
      hoursToRunUnit: "h",
      highAlert: false,
    });

    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toEqual([
      {
        name: "patientWeight",
        label: "Тегло на пациента",
        message: "Тегло на пациента трябва да бъде положително число.",
      },
    ]);
  });

  it("rejects invalid optional hours to run when provided", () => {
    const result = calculateInfusionDoseRate({
      medicationAmount: "500",
      medicationAmountUnit: "mg",
      finalVolume: "250",
      finalVolumeUnit: "mL",
      patientWeight: "",
      patientWeightUnit: "kg",
      prescribedRate: "25",
      prescribedRateUnit: "mg/h",
      hoursToRun: "0",
      hoursToRunUnit: "h",
      highAlert: false,
    });

    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toEqual([
      {
        name: "hoursToRun",
        label: "Часове за вливане",
        message: "Часове за вливане трябва да бъде положително число.",
      },
    ]);
  });

  it.each([
    ["volume", "0"],
    ["time", "0"],
  ])("rejects invalid volume/time field %s", (field, value) => {
    const input = {
      volume: "1",
      volumeUnit: "mL",
      time: "1",
      timeUnit: "h",
    };

    expect(calculateInfusionVolumeTime({ ...input, [field]: value }).ok).toBe(false);
  });
});
