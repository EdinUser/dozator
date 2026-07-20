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
  it("calculates final volume and diluent from an ampoule or vial", () => {
    const result = calculateDilution({
      availableAmount: "40",
      availableAmountUnit: "mg",
      availableVolume: "4",
      availableVolumeUnit: "mL",
      targetConcentration: "2",
      targetConcentrationUnit: "mg/mL",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("20 mL");
    expect(result.instructions).toContain("Добавете 16 mL от посочения разтворител.");
  });

  it("allows no-diluent case when target equals available amount in 1 mL", () => {
    const result = calculateDilution({
      availableAmount: "20",
      availableAmountUnit: "mg",
      availableVolume: "10",
      availableVolumeUnit: "mL",
      targetConcentration: "2",
      targetConcentrationUnit: "mg/mL",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("10 mL");
    expect(result.instructions).toContain("Добавете 0 mL от посочения разтворител.");
  });

  it("rejects target amount in 1 mL above the available amount in 1 mL", () => {
    const result = calculateDilution({
      availableAmount: "4",
      availableAmountUnit: "mg",
      availableVolume: "2",
      availableVolumeUnit: "mL",
      targetConcentration: "10",
      targetConcentrationUnit: "mg/mL",
      highAlert: false,
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]).toContain("по-високо");
    expect(result.fieldErrors.map((field) => field.name)).toEqual(["targetConcentration"]);
  });

  it("shows conversion notices for concentration units", () => {
    const result = calculateDilution({
      availableAmount: "10",
      availableAmountUnit: "mg",
      availableVolume: "1",
      availableVolumeUnit: "mL",
      targetConcentration: "500",
      targetConcentrationUnit: "µg/mL",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("20 mL");
    expect(result.notices).toContain("500 µg/mL = 0.5 mg/mL");
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
    expect(result.finalLines).toContain("Количество в 1 mL: 100 mg/mL");
    expect(result.primary).toBe("3.5 mL");
  });

  it("calculates needed final volume from desired amount in 1 mL", () => {
    const result = calculateReconstitution({
      vialAmount: "1",
      vialAmountUnit: "g",
      diluentVolume: "",
      diluentVolumeUnit: "mL",
      finalVolume: "",
      finalVolumeUnit: "mL",
      targetConcentration: "100",
      targetConcentrationUnit: "mg/mL",
      requiredDose: "",
      requiredDoseUnit: "mg",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("10 mL");
    expect(result.instructions).toContain("Необходим краен обем след разтваряне: 10 mL.");
    expect(result.instructions).toContain("Проверете в инструкцията дали добавеният разтворител е равен на крайния обем.");
  });
});

describe("infusion calculators", () => {
  it("calculates pump rate from medication amount and prescribed mg per hour", () => {
    const result = calculateInfusionDoseRate({
      medicationAmount: "500",
      medicationAmountUnit: "mg",
      finalVolume: "250",
      finalVolumeUnit: "mL",
      patientWeight: "",
      patientWeightUnit: "kg",
      prescribedRate: "25",
      prescribedRateUnit: "mg/h",
      hoursToRun: "",
      hoursToRunUnit: "h",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("12.5 mL/h");
  });

  it("calculates pump rate from weight-based microgram per minute dose", () => {
    const result = calculateInfusionDoseRate({
      medicationAmount: "250",
      medicationAmountUnit: "mg",
      finalVolume: "50",
      finalVolumeUnit: "mL",
      patientWeight: "70",
      patientWeightUnit: "kg",
      prescribedRate: "5",
      prescribedRateUnit: "µg/kg/min",
      hoursToRun: "",
      hoursToRunUnit: "h",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("4.2 mL/h");
    expect(result.traces).toContain("5 µg/kg/min × 70 kg × 60 min/h = 21 mg/h");
  });

  it("calculates pump rate from weight-based microgram per hour dose", () => {
    const result = calculateInfusionDoseRate({
      medicationAmount: "200",
      medicationAmountUnit: "mg",
      finalVolume: "50",
      finalVolumeUnit: "mL",
      patientWeight: "70",
      patientWeightUnit: "kg",
      prescribedRate: "5",
      prescribedRateUnit: "µg/kg/h",
      hoursToRun: "",
      hoursToRunUnit: "h",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("0.0875 mL/h");
    expect(result.traces).toContain("5 µg/kg/h × 70 kg = 0.35 mg/h");
    expect(result.traces).toContain("0.35 mg/h ÷ 4 mg/mL = 0.0875 mL/h");
  });

  it("calculates optional volume speed from hours to run", () => {
    const result = calculateInfusionDoseRate({
      medicationAmount: "500",
      medicationAmountUnit: "mg",
      finalVolume: "250",
      finalVolumeUnit: "mL",
      patientWeight: "",
      patientWeightUnit: "kg",
      prescribedRate: "25",
      prescribedRateUnit: "mg/h",
      hoursToRun: "5",
      hoursToRunUnit: "h",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("12.5 mL/h");
    expect(result.instructions).toContain("Ако целият обем се влива за 5 h, скоростта по обем е 50 mL/h.");
    expect(result.traces).toContain("250 mL ÷ 5 h = 50 mL/h");
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
