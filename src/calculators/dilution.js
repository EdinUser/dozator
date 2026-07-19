import {
  concentrationToMgPerMl,
  concentrationConversionTrace,
  formatConcentrationMgPerMl,
  formatMassMg,
  formatNumber,
  formatVolumeMl,
  toMl,
} from "../units/units.js";
import { highAlertWarning, validatePositiveFieldEntries, volumeWarnings } from "../safety/warnings.js";
import { bg } from "../i18n/bg.js";

export function calculateDilution(input) {
  const fieldErrors = validatePositiveFieldEntries([
    { name: "availableAmount", label: bg.fields.availableConcentrationAmount, value: input.availableAmount },
    { name: "availableVolume", label: bg.fields.availableConcentrationVolume, value: input.availableVolume },
    { name: "targetAmount", label: bg.fields.targetConcentrationAmount, value: input.targetAmount },
    { name: "targetVolume", label: bg.fields.targetConcentrationVolume, value: input.targetVolume },
    { name: "finalVolume", label: bg.fields.finalVolume, value: input.finalVolume },
  ]);

  if (fieldErrors.length) {
    return { ok: false, errors: fieldErrors.map((field) => field.message), fieldErrors };
  }

  const availableMgPerMl = concentrationToMgPerMl(input.availableAmount, input.availableAmountUnit, input.availableVolume, input.availableVolumeUnit);
  const targetMgPerMl = concentrationToMgPerMl(input.targetAmount, input.targetAmountUnit, input.targetVolume, input.targetVolumeUnit);
  const finalMl = toMl(input.finalVolume, input.finalVolumeUnit);

  if (targetMgPerMl > availableMgPerMl) {
    return {
      ok: false,
      errors: [bg.calculations.dilution.impossibleTarget],
      fieldErrors: [
        { name: "targetAmount", message: bg.calculations.dilution.impossibleTarget },
        { name: "targetVolume", message: bg.calculations.dilution.impossibleTarget },
      ],
    };
  }

  const medicationMl = (targetMgPerMl * finalMl) / availableMgPerMl;
  const diluentMl = finalMl - medicationMl;
  const totalMg = targetMgPerMl * finalMl;

  if (medicationMl > finalMl) {
    return {
      ok: false,
      errors: [bg.calculations.dilution.medicationVolumeGreaterThanFinal],
      fieldErrors: [
        { name: "availableAmount", message: bg.calculations.dilution.medicationVolumeGreaterThanFinal },
        { name: "availableVolume", message: bg.calculations.dilution.medicationVolumeGreaterThanFinal },
        { name: "targetAmount", message: bg.calculations.dilution.medicationVolumeGreaterThanFinal },
        { name: "targetVolume", message: bg.calculations.dilution.medicationVolumeGreaterThanFinal },
        { name: "finalVolume", message: bg.calculations.dilution.medicationVolumeGreaterThanFinal },
      ],
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
      bg.calculations.dilution.withdraw(formatVolumeMl(medicationMl)),
      bg.calculations.dilution.addDiluent(formatVolumeMl(diluentMl)),
      bg.calculations.dilution.finalVolume(formatVolumeMl(finalMl)),
      bg.calculations.dilution.finalConcentration(formatConcentrationMgPerMl(targetMgPerMl)),
    ],
    finalLines: [
      bg.calculations.dilution.totalAmount(formatMassMg(totalMg)),
      bg.calculations.dilution.finalVolumeLine(formatVolumeMl(finalMl)),
      bg.calculations.dilution.finalConcentrationLine(formatConcentrationMgPerMl(targetMgPerMl)),
    ],
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
      recipe: bg.calculations.dilution.recipe(formatVolumeMl(medicationMl), formatVolumeMl(diluentMl)),
    },
  };
}
