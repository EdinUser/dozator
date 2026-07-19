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
import { bg } from "../i18n/bg.js";

export function calculateDose(input) {
  const errors = validatePositiveFields([
    { label: bg.fields.prescribedDose, value: input.requiredDose },
    { label: bg.fields.availableAmount, value: input.availableAmount },
    { label: bg.fields.availableVolume, value: input.availableVolume },
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
    instructions: [bg.calculations.dose.withdraw(formatVolumeMl(withdrawMl)), bg.calculations.dose.contains(formatMassMg(requiredMg))],
    finalLines: [bg.calculations.dose.finalDose(formatMassMg(requiredMg))],
    notices,
    traces,
    warnings: [...volumeWarnings(withdrawMl), ...highAlertWarning(input.highAlert)],
    label: {
      totalAmount: formatMassMg(requiredMg),
      finalVolume: formatVolumeMl(withdrawMl),
      concentration: `${formatNumber(availableMgPerMl)} mg/mL`,
      recipe: bg.calculations.dose.withdraw(formatVolumeMl(withdrawMl)),
    },
  };
}
