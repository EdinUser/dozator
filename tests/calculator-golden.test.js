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
      name: "dilution to target concentration",
      calculate: calculateDilution,
      input: {
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
      },
      primary: "4 mL",
      instructions: [
        "Изтеглете 4 mL от първоначалния разтвор.",
        "Добавете 16 mL от посочения разтворител.",
        "Краен обем: 20 mL.",
        "Крайна концентрация: 2 mg/mL.",
      ],
      traces: ["10 mg/mL × 4 mL = 40 mg", "40 mg ÷ 20 mL = 2 mg/mL"],
      finalLines: ["Общо количество: 40 mg", "Краен обем: 20 mL", "Крайна концентрация: 2 mg/mL"],
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
        "Получена концентрация: 100 mg/mL.",
        "За доза 350 mg изтеглете 3.5 mL.",
      ],
      traces: ["1 g ÷ 10 mL = 100 mg/mL", "350 mg ÷ 100 mg/mL = 3.5 mL"],
      finalLines: ["Количество във флакона: 1 g", "Краен разтворен обем: 10 mL", "Концентрация: 100 mg/mL", "Доза за изтегляне: 350 mg"],
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
        prescribedRate: "25",
        prescribedRateUnit: "mg/h",
        highAlert: false,
      },
      primary: "12.5 mL/h",
      instructions: ["Концентрация в инфузията: 2 mg/mL.", "Настройте помпата на 12.5 mL/h."],
      traces: ["500 mg ÷ 250 mL = 2 mg/mL", "25 mg/h ÷ 2 mg/mL = 12.5 mL/h"],
      finalLines: ["Количество: 500 mg", "Краен обем: 250 mL", "Скорост: 25 mg/h"],
      label: {
        totalAmount: "500 mg",
        finalVolume: "250 mL",
        concentration: "2 mg/mL",
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
