import {
  concentrationToMgPerMl,
  concentrationConversionTrace,
  formatConcentrationMgPerMl,
  formatMassMg,
  formatNumber,
  formatVolumeMl,
  toMl,
} from "../units/units.js";
import { highAlertWarning, validatePositiveFields, volumeWarnings } from "../safety/warnings.js";

export function calculateDilution(input) {
  const errors = validatePositiveFields([
    { label: "Налична концентрация - количество", value: input.availableAmount },
    { label: "Налична концентрация - обем", value: input.availableVolume },
    { label: "Желана концентрация - количество", value: input.targetAmount },
    { label: "Желана концентрация - обем", value: input.targetVolume },
    { label: "Краен обем", value: input.finalVolume },
  ]);

  if (errors.length) {
    return { ok: false, errors };
  }

  const availableMgPerMl = concentrationToMgPerMl(input.availableAmount, input.availableAmountUnit, input.availableVolume, input.availableVolumeUnit);
  const targetMgPerMl = concentrationToMgPerMl(input.targetAmount, input.targetAmountUnit, input.targetVolume, input.targetVolumeUnit);
  const finalMl = toMl(input.finalVolume, input.finalVolumeUnit);

  if (targetMgPerMl > availableMgPerMl) {
    return {
      ok: false,
      errors: ["Желаната концентрация е по-висока от наличната. Това не може да се получи чрез разреждане."],
    };
  }

  const medicationMl = (targetMgPerMl * finalMl) / availableMgPerMl;
  const diluentMl = finalMl - medicationMl;
  const totalMg = targetMgPerMl * finalMl;

  if (medicationMl > finalMl) {
    return {
      ok: false,
      errors: ["Необходимият обем от лекарството е по-голям от крайния обем."],
    };
  }

  const notices = [
    ...concentrationConversionTrace(input.availableAmount, input.availableAmountUnit, input.availableVolume, input.availableVolumeUnit),
    ...concentrationConversionTrace(input.targetAmount, input.targetAmountUnit, input.targetVolume, input.targetVolumeUnit),
  ];

  return {
    ok: true,
    primary: formatVolumeMl(medicationMl),
    instructions: [
      `Изтеглете ${formatVolumeMl(medicationMl)} от първоначалния разтвор.`,
      `Добавете ${formatVolumeMl(diluentMl)} от посочения разтворител.`,
      `Краен обем: ${formatVolumeMl(finalMl)}.`,
      `Крайна концентрация: ${formatConcentrationMgPerMl(targetMgPerMl)}.`,
    ],
    finalLines: [`Общо количество: ${formatMassMg(totalMg)}`, `Краен обем: ${formatVolumeMl(finalMl)}`, `Крайна концентрация: ${formatConcentrationMgPerMl(targetMgPerMl)}`],
    notices,
    traces: [
      `${formatConcentrationMgPerMl(availableMgPerMl)} × ${formatVolumeMl(medicationMl)} = ${formatMassMg(totalMg)}`,
      `${formatMassMg(totalMg)} ÷ ${formatVolumeMl(finalMl)} = ${formatConcentrationMgPerMl(targetMgPerMl)}`,
    ],
    warnings: [...volumeWarnings(medicationMl), ...highAlertWarning(input.highAlert)],
    label: {
      totalAmount: formatMassMg(totalMg),
      finalVolume: formatVolumeMl(finalMl),
      concentration: `${formatNumber(targetMgPerMl)} mg/mL`,
      recipe: `Изтеглете ${formatVolumeMl(medicationMl)} лекарство. Добавете ${formatVolumeMl(diluentMl)} разтворител.`,
    },
  };
}
