import { describe, expect, it } from "vitest";
import { calculateDilution } from "../src/calculators/dilution.js";
import { calculateDose } from "../src/calculators/dose.js";
import { calculateInfusionDoseRate, calculateInfusionMedicationAmount, calculateInfusionVolumeTime } from "../src/calculators/infusion.js";
import { calculateIuConverter } from "../src/calculators/iu-converter.js";
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

  it("calculates volume from an IU-based prepared solution", () => {
    const result = calculateDose({
      requiredDose: "2500",
      requiredDoseUnit: "IU",
      availableAmount: "10000",
      availableAmountUnit: "IU",
      availableVolume: "2",
      availableVolumeUnit: "mL",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("0.5 mL");
    expect(result.traces).toEqual(["2500 IU ÷ 5000 IU/mL = 0.5 mL"]);
    expect(result.notices).toEqual([]);
    expect(result.label.concentration).toBe("5000 IU/mL");
  });

  it("rejects mixed IU and mass dose units", () => {
    const result = calculateDose({
      requiredDose: "250",
      requiredDoseUnit: "µg",
      availableAmount: "5000",
      availableAmountUnit: "IU",
      availableVolume: "1",
      availableVolumeUnit: "mL",
      highAlert: false,
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("IU и масови единици не могат да се смесват в едно изчисление.");
    expect(result.fieldErrors.map((field) => field.name)).toEqual(["requiredDoseUnit", "availableAmountUnit"]);
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

  it("calculates final volume from medication amount when no initial volume is known", () => {
    const result = calculateDilution({
      availableAmount: "1",
      availableAmountUnit: "g",
      availableVolume: "",
      availableVolumeUnit: "mL",
      targetConcentration: "100",
      targetConcentrationUnit: "mg/mL",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("10 mL");
    expect(result.instructions).toContain("Използвайте 1 g лекарство.");
    expect(result.instructions).toContain("Пригответе до краен обем 10 mL с посочения разтворител.");
    expect(result.traces).toEqual(["1 g ÷ 100 mg/mL = 10 mL"]);
    expect(result.label.recipe).toBe("Пригответе до краен обем 10 mL.");
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

  it("keeps percent target visible in the preparation summary", () => {
    const result = calculateDilution({
      availableAmount: "2",
      availableAmountUnit: "g",
      availableVolume: "1",
      availableVolumeUnit: "mL",
      targetConcentration: "3",
      targetConcentrationUnit: "%",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.instructions).toContain("Крайно количество в 1 mL: 30 mg/mL, което е 3% разтвор.");
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

  it("dilutes from concentration to a lower concentration", () => {
    const result = calculateDilution({
      mode: "concentration",
      sourceConcentration: "10",
      sourceConcentrationUnit: "%",
      sourceVolume: "5",
      sourceVolumeUnit: "mL",
      targetConcentration: "2",
      targetConcentrationUnit: "%",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("25 mL");
    expect(result.instructions).toContain("Добавете 20 mL от посочения разтворител.");
    expect(result.traces).toEqual([
      "100 mg/mL × 5 mL = 500 mg",
      "500 mg ÷ 20 mg/mL = 25 mL",
      "25 mL - 5 mL = 20 mL",
    ]);
  });

  it("calculates final volume from an IU amount", () => {
    const result = calculateDilution({
      availableAmount: "10000",
      availableAmountUnit: "IU",
      availableVolume: "2",
      availableVolumeUnit: "mL",
      targetConcentration: "1000",
      targetConcentrationUnit: "IU/mL",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("10 mL");
    expect(result.instructions).toContain("Крайно количество в 1 mL: 1000 IU/mL.");
    expect(result.traces).toEqual(["10000 IU ÷ 2 mL = 5000 IU/mL", "10000 IU ÷ 1000 IU/mL = 10 mL"]);
  });

  it("rejects mixed IU amount and mass target concentration", () => {
    const result = calculateDilution({
      availableAmount: "10000",
      availableAmountUnit: "IU",
      availableVolume: "2",
      availableVolumeUnit: "mL",
      targetConcentration: "1",
      targetConcentrationUnit: "mg/mL",
      highAlert: false,
    });

    expect(result.ok).toBe(false);
    expect(result.fieldErrors.map((field) => field.name)).toEqual(["availableAmountUnit", "targetConcentrationUnit"]);
  });

  it("dilutes from an IU concentration to a lower IU concentration", () => {
    const result = calculateDilution({
      mode: "concentration",
      sourceConcentration: "5000",
      sourceConcentrationUnit: "IU/mL",
      sourceVolume: "2",
      sourceVolumeUnit: "mL",
      targetConcentration: "1000",
      targetConcentrationUnit: "IU/mL",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("10 mL");
    expect(result.traces).toEqual([
      "5000 IU/mL × 2 mL = 10000 IU",
      "10000 IU ÷ 1000 IU/mL = 10 mL",
      "10 mL - 2 mL = 8 mL",
    ]);
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

  it("calculates reconstitution and withdrawal in IU", () => {
    const result = calculateReconstitution({
      vialAmount: "10000",
      vialAmountUnit: "IU",
      diluentVolume: "2",
      diluentVolumeUnit: "mL",
      finalVolume: "2",
      finalVolumeUnit: "mL",
      targetConcentration: "",
      targetConcentrationUnit: "IU/mL",
      requiredDose: "2500",
      requiredDoseUnit: "IU",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("0.5 mL");
    expect(result.finalLines).toContain("Количество в 1 mL: 5000 IU/mL");
    expect(result.traces).toEqual(["10000 IU ÷ 2 mL = 5000 IU/mL", "2500 IU ÷ 5000 IU/mL = 0.5 mL"]);
  });

  it("rejects mixed IU vial amount and mass withdrawal dose", () => {
    const result = calculateReconstitution({
      vialAmount: "10000",
      vialAmountUnit: "IU",
      diluentVolume: "",
      diluentVolumeUnit: "mL",
      finalVolume: "2",
      finalVolumeUnit: "mL",
      targetConcentration: "",
      targetConcentrationUnit: "IU/mL",
      requiredDose: "250",
      requiredDoseUnit: "µg",
      highAlert: false,
    });

    expect(result.ok).toBe(false);
    expect(result.fieldErrors.map((field) => field.name)).toEqual(["vialAmountUnit", "requiredDoseUnit"]);
  });
});

describe("infusion calculators", () => {
  it("calculates medication amount for 24 hours from weight and micrograms per kg per minute", () => {
    const result = calculateInfusionMedicationAmount({
      amountPatientWeight: "1",
      amountPatientWeightUnit: "kg",
      amountPrescribedRate: "5",
      amountPrescribedRateUnit: "µg/kg/min",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("7.2 mg");
    expect(result.instructions).toContain("Количество лекарство за 24 h: 7.2 mg.");
    expect(result.traces).toEqual([
      "1 kg × 5 µg/kg/min = 5 µg/min",
      "5 µg/min × 60 min/h × 24 h = 7200 µg = 7.2 mg",
    ]);
    expect(result.carryForward).toEqual({
      targetMode: "doseRate",
      medicationAmountMg: 7.2,
      patientWeightKg: 1,
    });
  });

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

  it("calculates pump rate from IU amount and IU per hour", () => {
    const result = calculateInfusionDoseRate({
      medicationAmount: "10000",
      medicationAmountUnit: "IU",
      finalVolume: "100",
      finalVolumeUnit: "mL",
      patientWeight: "",
      patientWeightUnit: "kg",
      prescribedRate: "500",
      prescribedRateUnit: "IU/h",
      hoursToRun: "",
      hoursToRunUnit: "h",
      highAlert: false,
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("5 mL/h");
    expect(result.instructions).toContain("Количество лекарство в 1 mL от инфузията: 100 IU/mL.");
    expect(result.traces).toEqual(["10000 IU ÷ 100 mL = 100 IU/mL", "500 IU/h ÷ 100 IU/mL = 5 mL/h"]);
    expect(result.finalLines).toContain("Обща дозова скорост: 500 IU/h");
    expect(result.label.concentration).toBe("100 IU/mL");
  });

  it("rejects mixed IU medication amount and mass prescribed rate", () => {
    const result = calculateInfusionDoseRate({
      medicationAmount: "10000",
      medicationAmountUnit: "IU",
      finalVolume: "100",
      finalVolumeUnit: "mL",
      patientWeight: "",
      patientWeightUnit: "kg",
      prescribedRate: "25",
      prescribedRateUnit: "mg/h",
      hoursToRun: "",
      hoursToRunUnit: "h",
      highAlert: false,
    });

    expect(result.ok).toBe(false);
    expect(result.fieldErrors.map((field) => field.name)).toEqual(["medicationAmountUnit", "prescribedRateUnit"]);
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
    expect(result.primary).toBe("0.088 mL/h");
    expect(result.traces).toContain("5 µg/kg/h × 70 kg = 0.35 mg/h");
    expect(result.traces).toContain("0.35 mg/h ÷ 4 mg/mL = 0.088 mL/h");
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

describe("IU converter", () => {
  it("converts IU to the selected mass unit from a user-supplied relationship", () => {
    const result = calculateIuConverter({
      mode: "iuToMass",
      relationshipIu: "1",
      relationshipIuUnit: "IU",
      relationshipMass: "0.025",
      relationshipMassUnit: "µg",
      amountToConvert: "2000",
      amountToConvertUnit: "IU",
      resultMassUnit: "µg",
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("50 µg");
    expect(result.traces).toEqual([
      "1 IU = 0.025 µg = 0.000025 mg/IU",
      "2000 IU × 0.000025 mg/IU = 50 µg",
    ]);
    expect(result.carryForward).toEqual({
      targetCalculator: "dose",
      values: {
        requiredDose: "50",
        requiredDoseUnit: "µg",
      },
    });
  });

  it("converts mass to IU from a user-supplied relationship", () => {
    const result = calculateIuConverter({
      mode: "massToIu",
      relationshipIu: "1",
      relationshipIuUnit: "IU",
      relationshipMass: "0.025",
      relationshipMassUnit: "µg",
      amountToConvert: "50",
      amountToConvertUnit: "µg",
      resultMassUnit: "µg",
    });

    expect(result.ok).toBe(true);
    expect(result.primary).toBe("2000 IU");
    expect(result.traces).toEqual([
      "1 IU = 0.025 µg = 0.000025 mg/IU",
      "50 µg = 0.05 mg",
      "0.05 mg ÷ 0.000025 mg/IU = 2000 IU",
    ]);
    expect(result.carryForward.values).toEqual({
      requiredDose: "2000",
      requiredDoseUnit: "IU",
    });
  });

  it("rejects missing relationship values", () => {
    const result = calculateIuConverter({
      mode: "iuToMass",
      relationshipIu: "",
      relationshipIuUnit: "IU",
      relationshipMass: "0.025",
      relationshipMassUnit: "µg",
      amountToConvert: "2000",
      amountToConvertUnit: "IU",
      resultMassUnit: "µg",
    });

    expect(result.ok).toBe(false);
    expect(result.fieldErrors.map((field) => field.name)).toEqual(["relationshipIu"]);
  });
});
