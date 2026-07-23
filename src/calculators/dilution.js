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
  if (input.mode === "concentration") {
    return calculateConcentrationDilution(input);
  }

  const hasMedicationVolume = String(input.availableVolume || "").trim() !== "";
  const fieldErrors = validatePositiveFieldEntries([
    { name: "availableAmount", label: bg.fields.containerAmount, value: input.availableAmount },
    ...(hasMedicationVolume ? [{ name: "availableVolume", label: bg.fields.containerVolume, value: input.availableVolume }] : []),
    { name: "targetConcentration", label: bg.fields.targetAmountPerMl, value: input.targetConcentration },
  ]);

  if (fieldErrors.length) {
    return { ok: false, errors: fieldErrors.map((field) => field.message), fieldErrors };
  }

  const medicationMg = toMg(input.availableAmount, input.availableAmountUnit);
  const medicationMl = hasMedicationVolume ? toMl(input.availableVolume, input.availableVolumeUnit) : null;
  const availableMgPerMl = hasMedicationVolume ? medicationMg / medicationMl : null;
  const targetMgPerMl = directConcentrationToMgPerMl(input.targetConcentration, input.targetConcentrationUnit);

  if (hasMedicationVolume && targetMgPerMl > availableMgPerMl) {
    return {
      ok: false,
      errors: [bg.calculations.dilution.impossibleTarget],
      fieldErrors: [{ name: "targetConcentration", message: bg.calculations.dilution.impossibleTarget }],
    };
  }

  const finalMl = medicationMg / targetMgPerMl;
  const diluentMl = hasMedicationVolume ? finalMl - medicationMl : null;
  const targetSolutionDescription =
    input.targetConcentrationUnit === "%" ? `${formatNumber(input.targetConcentration)}% разтвор` : "";
  const notices = [
    massConversionTrace(input.availableAmount, input.availableAmountUnit, "mg"),
    hasMedicationVolume ? volumeConversionTrace(input.availableVolume, input.availableVolumeUnit, "mL") : null,
    directConcentrationConversionTrace(input.targetConcentration, input.targetConcentrationUnit),
  ].filter(Boolean);
  const instructions = hasMedicationVolume
    ? [
        bg.calculations.dilution.useContainer(formatMassMg(medicationMg), formatVolumeMl(medicationMl)),
        bg.calculations.dilution.addDiluent(formatVolumeMl(diluentMl)),
        bg.calculations.dilution.finalVolume(formatVolumeMl(finalMl)),
        bg.calculations.dilution.finalConcentration(formatConcentrationMgPerMl(targetMgPerMl), targetSolutionDescription),
      ]
    : [
        bg.calculations.dilution.useAmountOnly(formatMassMg(medicationMg)),
        bg.calculations.dilution.prepareToFinalVolume(formatVolumeMl(finalMl)),
        bg.calculations.dilution.finalConcentration(formatConcentrationMgPerMl(targetMgPerMl), targetSolutionDescription),
      ];
  const traces = [
    hasMedicationVolume ? `${formatMassMg(medicationMg)} ÷ ${formatVolumeMl(medicationMl)} = ${formatConcentrationMgPerMl(availableMgPerMl)}` : null,
    `${formatMassMg(medicationMg)} ÷ ${formatConcentrationMgPerMl(targetMgPerMl)} = ${formatVolumeMl(finalMl)}`,
  ].filter(Boolean);

  return {
    ok: true,
    primary: formatVolumeMl(finalMl),
    instructions,
    finalLines: [
      bg.calculations.dilution.totalAmount(formatMassMg(medicationMg)),
      bg.calculations.dilution.finalVolumeLine(formatVolumeMl(finalMl)),
      bg.calculations.dilution.finalConcentrationLine(formatConcentrationMgPerMl(targetMgPerMl)),
    ],
    notices,
    traces,
    warnings: [...(Number.isFinite(medicationMl) ? volumeWarnings(medicationMl) : []), ...highAlertWarning(input.highAlert)],
    label: {
      totalAmount: formatMassMg(medicationMg),
      finalVolume: formatVolumeMl(finalMl),
      concentration: `${formatNumber(targetMgPerMl)} mg/mL`,
      recipe: hasMedicationVolume
        ? bg.calculations.dilution.recipe(formatVolumeMl(medicationMl), formatVolumeMl(diluentMl))
        : bg.calculations.dilution.amountOnlyRecipe(formatVolumeMl(finalMl)),
    },
  };
}

function calculateConcentrationDilution(input) {
  const fieldErrors = validatePositiveFieldEntries([
    { name: "sourceConcentration", label: bg.fields.sourceConcentration, value: input.sourceConcentration },
    { name: "sourceVolume", label: bg.fields.sourceVolume, value: input.sourceVolume },
    { name: "targetConcentration", label: bg.fields.targetAmountPerMl, value: input.targetConcentration },
  ]);

  if (fieldErrors.length) {
    return { ok: false, errors: fieldErrors.map((field) => field.message), fieldErrors };
  }

  const sourceMgPerMl = directConcentrationToMgPerMl(input.sourceConcentration, input.sourceConcentrationUnit);
  const sourceMl = toMl(input.sourceVolume, input.sourceVolumeUnit);
  const targetMgPerMl = directConcentrationToMgPerMl(input.targetConcentration, input.targetConcentrationUnit);

  if (targetMgPerMl > sourceMgPerMl) {
    return {
      ok: false,
      errors: [bg.calculations.dilution.impossibleTarget],
      fieldErrors: [{ name: "targetConcentration", message: bg.calculations.dilution.impossibleTarget }],
    };
  }

  const finalMl = (sourceMgPerMl * sourceMl) / targetMgPerMl;
  const diluentMl = finalMl - sourceMl;
  const totalMedicationMg = sourceMgPerMl * sourceMl;
  const notices = [
    directConcentrationConversionTrace(input.sourceConcentration, input.sourceConcentrationUnit),
    volumeConversionTrace(input.sourceVolume, input.sourceVolumeUnit, "mL"),
    directConcentrationConversionTrace(input.targetConcentration, input.targetConcentrationUnit),
  ].filter(Boolean);

  return {
    ok: true,
    primary: formatVolumeMl(finalMl),
    instructions: [
      bg.calculations.dilution.useSourceSolution(formatVolumeMl(sourceMl), formatConcentrationMgPerMl(sourceMgPerMl)),
      bg.calculations.dilution.addDiluent(formatVolumeMl(diluentMl)),
      bg.calculations.dilution.finalVolume(formatVolumeMl(finalMl)),
      bg.calculations.dilution.finalConcentration(formatConcentrationMgPerMl(targetMgPerMl), concentrationDescription(input.targetConcentration, input.targetConcentrationUnit)),
    ],
    finalLines: [
      bg.calculations.dilution.sourceConcentrationLine(formatConcentrationMgPerMl(sourceMgPerMl)),
      bg.calculations.dilution.finalVolumeLine(formatVolumeMl(finalMl)),
      bg.calculations.dilution.finalConcentrationLine(formatConcentrationMgPerMl(targetMgPerMl)),
    ],
    notices,
    traces: [
      `${formatConcentrationMgPerMl(sourceMgPerMl)} × ${formatVolumeMl(sourceMl)} = ${formatMassMg(totalMedicationMg)}`,
      `${formatMassMg(totalMedicationMg)} ÷ ${formatConcentrationMgPerMl(targetMgPerMl)} = ${formatVolumeMl(finalMl)}`,
      `${formatVolumeMl(finalMl)} - ${formatVolumeMl(sourceMl)} = ${formatVolumeMl(diluentMl)}`,
    ],
    warnings: [...volumeWarnings(sourceMl), ...highAlertWarning(input.highAlert)],
    label: {
      totalAmount: formatMassMg(totalMedicationMg),
      finalVolume: formatVolumeMl(finalMl),
      concentration: `${formatNumber(targetMgPerMl)} mg/mL`,
      recipe: bg.calculations.dilution.recipe(formatVolumeMl(sourceMl), formatVolumeMl(diluentMl)),
    },
  };
}

function concentrationDescription(value, unit) {
  return unit === "%" ? `${formatNumber(value)}% разтвор` : "";
}
