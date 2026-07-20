import { describe, expect, it } from "vitest";
import { calculateDilution } from "../src/calculators/dilution.js";
import { calculateDose } from "../src/calculators/dose.js";
import { calculateInfusionDoseRate, calculateInfusionVolumeTime } from "../src/calculators/infusion.js";
import { calculateReconstitution } from "../src/calculators/reconstitution.js";

describe("golden calculator scenarios", () => {
  it.each([
    {
      name: "dose from prepared solution",
      calculate: calculateDose,
      input: {
        requiredDose: "125",
        requiredDoseUnit: "mg",
        availableAmount: "250",
        availableAmountUnit: "mg",
        availableVolume: "5",
        availableVolumeUnit: "mL",
        highAlert: false,
      },
      primary: "2.5 mL",
      instructions: ["Изтеглете 2.5 mL от наличния разтвор.", "Обемът съдържа 125 mg."],
      traces: ["125 mg ÷ 50 mg/mL = 2.5 mL"],
      finalLines: ["Назначена доза: 125 mg"],
      label: {
        totalAmount: "125 mg",
        finalVolume: "2.5 mL",
        concentration: "50 mg/mL",
      },
    },
    {
      name: "dilution to target amount in 1 mL",
      calculate: calculateDilution,
      input: {
        availableAmount: "40",
        availableAmountUnit: "mg",
        availableVolume: "4",
        availableVolumeUnit: "mL",
        targetConcentration: "2",
        targetConcentrationUnit: "mg/mL",
        highAlert: false,
      },
      primary: "20 mL",
      instructions: [
        "Използвайте 40 mg в 4 mL от ампулата/флакона.",
        "Добавете 16 mL от посочения разтворител.",
        "Краен обем: 20 mL.",
        "Крайно количество в 1 mL: 2 mg/mL.",
      ],
      traces: ["40 mg ÷ 4 mL = 10 mg/mL", "40 mg ÷ 2 mg/mL = 20 mL"],
      finalLines: ["Общо количество: 40 mg", "Краен обем: 20 mL", "Количество в 1 mL: 2 mg/mL"],
      label: {
        totalAmount: "40 mg",
        finalVolume: "20 mL",
        concentration: "2 mg/mL",
      },
    },
    {
      name: "vial reconstitution with dose withdrawal",
      calculate: calculateReconstitution,
      input: {
        vialAmount: "1",
        vialAmountUnit: "g",
        diluentVolume: "10",
        diluentVolumeUnit: "mL",
        finalVolume: "10",
        finalVolumeUnit: "mL",
        requiredDose: "350",
        requiredDoseUnit: "mg",
        highAlert: false,
      },
      primary: "3.5 mL",
      instructions: [
        "Добавете 10 mL от посочения разтворител към флакона.",
        "Използвайте крайния разтворен обем от инструкцията: 10 mL.",
        "Получено количество в 1 mL: 100 mg/mL.",
        "За доза 350 mg изтеглете 3.5 mL.",
      ],
      traces: ["1 g ÷ 10 mL = 100 mg/mL", "350 mg ÷ 100 mg/mL = 3.5 mL"],
      finalLines: ["Количество във флакона: 1 g", "Краен разтворен обем: 10 mL", "Количество в 1 mL: 100 mg/mL", "Доза за изтегляне: 350 mg"],
      label: {
        totalAmount: "1 g",
        finalVolume: "10 mL",
        concentration: "100 mg/mL",
      },
    },
    {
      name: "infusion dose per hour",
      calculate: calculateInfusionDoseRate,
      input: {
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
      },
      primary: "12.5 mL/h",
      instructions: [
        "Количество лекарство в 1 mL от инфузията: 2 mg/mL.",
        "Настройте помпата на 12.5 mL/h.",
        "Ако целият обем се влива за 5 h, скоростта по обем е 50 mL/h.",
      ],
      traces: ["500 mg ÷ 250 mL = 2 mg/mL", "25 mg/h ÷ 2 mg/mL = 12.5 mL/h", "250 mL ÷ 5 h = 50 mL/h"],
      finalLines: ["Количество: 500 mg", "Краен обем: 250 mL", "Обща дозова скорост: 25 mg/h", "Часове за вливане: 5 h"],
      label: {
        totalAmount: "500 mg",
        finalVolume: "250 mL",
        concentration: "2 mg/mL",
      },
    },
    {
      name: "infusion weight-based dose per minute",
      calculate: calculateInfusionDoseRate,
      input: {
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
      },
      primary: "4.2 mL/h",
      instructions: ["Количество лекарство в 1 mL от инфузията: 5 mg/mL.", "Настройте помпата на 4.2 mL/h."],
      traces: ["250 mg ÷ 50 mL = 5 mg/mL", "5 µg/kg/min × 70 kg × 60 min/h = 21 mg/h", "21 mg/h ÷ 5 mg/mL = 4.2 mL/h"],
      finalLines: ["Количество: 250 mg", "Краен обем: 50 mL", "Тегло: 70 kg", "Обща дозова скорост: 21 mg/h"],
      label: {
        totalAmount: "250 mg",
        finalVolume: "50 mL",
        concentration: "5 mg/mL",
      },
    },
    {
      name: "infusion volume over time",
      calculate: calculateInfusionVolumeTime,
      input: {
        volume: "500",
        volumeUnit: "mL",
        time: "4",
        timeUnit: "h",
      },
      primary: "125 mL/h",
      instructions: ["Настройте помпата на 125 mL/h."],
      traces: ["500 mL ÷ 4 h = 125 mL/h"],
      finalLines: ["Обем: 500 mL", "Време: 4 h"],
      label: {
        totalAmount: "",
        finalVolume: "500 mL",
        concentration: "",
      },
    },
  ])("$name", ({ calculate, input, primary, instructions, traces, finalLines, label }) => {
    const result = calculate(input);

    expect(result.ok).toBe(true);
    expect(result.primary).toBe(primary);
    expect(result.instructions).toEqual(instructions);
    expect(result.traces).toEqual(traces);
    expect(result.finalLines).toEqual(finalLines);
    expect(result.label).toMatchObject(label);
  });
});
