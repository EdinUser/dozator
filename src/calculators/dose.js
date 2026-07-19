import {
  concentrationToMgPerMl,
  concentrationConversionTrace,
  formatMassMg,
  formatNumber,
  formatVolumeMl,
  massConversionTrace,
  toMg,
} from "../units/units.js";
import { highAlertWarning, validatePositiveFields, volumeWarnings } from "../safety/warnings.js";

export function calculateDose(input) {
  const errors = validatePositiveFields([
    { label: "Назначена доза", value: input.requiredDose },
    { label: "Налично количество", value: input.availableAmount },
    { label: "Наличен обем", value: input.availableVolume },
  ]);

  if (errors.length) {
    return { ok: false, errors };
  }

  const requiredMg = toMg(input.requiredDose, input.requiredDoseUnit);
  const availableMgPerMl = concentrationToMgPerMl(
    input.availableAmount,
    input.availableAmountUnit,
    input.availableVolume,
    input.availableVolumeUnit,
  );
  const withdrawMl = requiredMg / availableMgPerMl;

  const traces = [
    `${formatMassMg(requiredMg)} ÷ ${formatMassMg(availableMgPerMl)}/mL = ${formatVolumeMl(withdrawMl)}`,
  ];
  const notices = [
    massConversionTrace(input.requiredDose, input.requiredDoseUnit, "mg"),
    ...concentrationConversionTrace(input.availableAmount, input.availableAmountUnit, input.availableVolume, input.availableVolumeUnit),
  ].filter(Boolean);

  return {
    ok: true,
    primary: formatVolumeMl(withdrawMl),
    instructions: [`Изтеглете ${formatVolumeMl(withdrawMl)} от наличния разтвор.`, `Обемът съдържа ${formatMassMg(requiredMg)}.`],
    finalLines: [`Назначена доза: ${formatMassMg(requiredMg)}`],
    notices,
    traces,
    warnings: [...volumeWarnings(withdrawMl), ...highAlertWarning(input.highAlert)],
    label: {
      totalAmount: formatMassMg(requiredMg),
      finalVolume: formatVolumeMl(withdrawMl),
      concentration: `${formatNumber(availableMgPerMl)} mg/mL`,
      recipe: `Изтеглете ${formatVolumeMl(withdrawMl)} от наличния разтвор.`,
    },
  };
}
