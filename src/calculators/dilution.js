import {
  directConcentrationConversionTrace,
  directConcentrationToMgPerMl,
  formatConcentrationMgPerMl,
  formatMassMg,
  formatNumber,
  formatVolumeMl,
  massConversionTrace,
  toMg,
  toMl,
  volumeConversionTrace,
} from "../units/units.js";
import { highAlertWarning, validatePositiveFieldEntries, volumeWarnings } from "../safety/warnings.js";
import { bg } from "../i18n/bg.js";

export function calculateDilution(input) {
  const fieldErrors = validatePositiveFieldEntries([
    { name: "availableAmount", label: bg.fields.containerAmount, value: input.availableAmount },
    { name: "availableVolume", label: bg.fields.containerVolume, value: input.availableVolume },
    { name: "targetConcentration", label: bg.fields.targetAmountPerMl, value: input.targetConcentration },
  ]);

  if (fieldErrors.length) {
    return { ok: false, errors: fieldErrors.map((field) => field.message), fieldErrors };
  }

  const medicationMg = toMg(input.availableAmount, input.availableAmountUnit);
  const medicationMl = toMl(input.availableVolume, input.availableVolumeUnit);
  const availableMgPerMl = medicationMg / medicationMl;
  const targetMgPerMl = directConcentrationToMgPerMl(input.targetConcentration, input.targetConcentrationUnit);

  if (targetMgPerMl > availableMgPerMl) {
    return {
      ok: false,
      errors: [bg.calculations.dilution.impossibleTarget],
      fieldErrors: [{ name: "targetConcentration", message: bg.calculations.dilution.impossibleTarget }],
    };
  }

  const finalMl = medicationMg / targetMgPerMl;
  const diluentMl = finalMl - medicationMl;
  const targetSolutionDescription =
    input.targetConcentrationUnit === "%" ? `${formatNumber(input.targetConcentration)}% разтвор` : "";
  const notices = [
    massConversionTrace(input.availableAmount, input.availableAmountUnit, "mg"),
    volumeConversionTrace(input.availableVolume, input.availableVolumeUnit, "mL"),
    directConcentrationConversionTrace(input.targetConcentration, input.targetConcentrationUnit),
  ].filter(Boolean);

  return {
    ok: true,
    primary: formatVolumeMl(finalMl),
    instructions: [
      bg.calculations.dilution.useContainer(formatMassMg(medicationMg), formatVolumeMl(medicationMl)),
      bg.calculations.dilution.addDiluent(formatVolumeMl(diluentMl)),
      bg.calculations.dilution.finalVolume(formatVolumeMl(finalMl)),
      bg.calculations.dilution.finalConcentration(formatConcentrationMgPerMl(targetMgPerMl), targetSolutionDescription),
    ],
    finalLines: [
      bg.calculations.dilution.totalAmount(formatMassMg(medicationMg)),
      bg.calculations.dilution.finalVolumeLine(formatVolumeMl(finalMl)),
      bg.calculations.dilution.finalConcentrationLine(formatConcentrationMgPerMl(targetMgPerMl)),
    ],
    notices,
    traces: [
      `${formatMassMg(medicationMg)} ÷ ${formatVolumeMl(medicationMl)} = ${formatConcentrationMgPerMl(availableMgPerMl)}`,
      `${formatMassMg(medicationMg)} ÷ ${formatConcentrationMgPerMl(targetMgPerMl)} = ${formatVolumeMl(finalMl)}`,
    ],
    warnings: [...volumeWarnings(medicationMl), ...highAlertWarning(input.highAlert)],
    label: {
      totalAmount: formatMassMg(medicationMg),
      finalVolume: formatVolumeMl(finalMl),
      concentration: `${formatNumber(targetMgPerMl)} mg/mL`,
      recipe: bg.calculations.dilution.recipe(formatVolumeMl(medicationMl), formatVolumeMl(diluentMl)),
    },
  };
}
