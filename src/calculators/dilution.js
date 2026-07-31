import {
  compatibleQuantityDomain,
  directQuantityConcentrationConversionTrace,
  directConcentrationToBasePerMl,
  formatConcentration,
  formatNumber,
  formatQuantity,
  formatVolumeMl,
  quantityConversionTrace,
  toBaseQuantity,
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

  const domain = compatibleQuantityDomain([input.availableAmountUnit, input.targetConcentrationUnit]);

  if (!domain) {
    fieldErrors.push(
      { name: "availableAmountUnit", message: bg.safety.incompatibleQuantityUnits },
      { name: "targetConcentrationUnit", message: bg.safety.incompatibleQuantityUnits },
    );
  }

  if (fieldErrors.length) {
    return { ok: false, errors: fieldErrors.map((field) => field.message), fieldErrors };
  }

  const medicationQuantity = toBaseQuantity(input.availableAmount, input.availableAmountUnit);
  const medicationMl = hasMedicationVolume ? toMl(input.availableVolume, input.availableVolumeUnit) : null;
  const availableQuantityPerMl = hasMedicationVolume ? medicationQuantity / medicationMl : null;
  const targetQuantityPerMl = directConcentrationToBasePerMl(input.targetConcentration, input.targetConcentrationUnit);

  if (hasMedicationVolume && targetQuantityPerMl > availableQuantityPerMl) {
    return {
      ok: false,
      errors: [bg.calculations.dilution.impossibleTarget],
      fieldErrors: [{ name: "targetConcentration", message: bg.calculations.dilution.impossibleTarget }],
    };
  }

  const finalMl = medicationQuantity / targetQuantityPerMl;
  const diluentMl = hasMedicationVolume ? finalMl - medicationMl : null;
  const targetSolutionDescription =
    input.targetConcentrationUnit === "%" ? `${formatNumber(input.targetConcentration)}% разтвор` : "";
  const notices = [
    quantityConversionTrace(input.availableAmount, input.availableAmountUnit, domain),
    hasMedicationVolume ? volumeConversionTrace(input.availableVolume, input.availableVolumeUnit, "mL") : null,
    directQuantityConcentrationConversionTrace(input.targetConcentration, input.targetConcentrationUnit, domain),
  ].filter(Boolean);
  const instructions = hasMedicationVolume
    ? [
        bg.calculations.dilution.useContainer(formatQuantity(medicationQuantity, domain), formatVolumeMl(medicationMl)),
        bg.calculations.dilution.addDiluent(formatVolumeMl(diluentMl)),
        bg.calculations.dilution.finalVolume(formatVolumeMl(finalMl)),
        bg.calculations.dilution.finalConcentration(formatConcentration(targetQuantityPerMl, domain), targetSolutionDescription),
      ]
    : [
        bg.calculations.dilution.useAmountOnly(formatQuantity(medicationQuantity, domain)),
        bg.calculations.dilution.prepareToFinalVolume(formatVolumeMl(finalMl)),
        bg.calculations.dilution.finalConcentration(formatConcentration(targetQuantityPerMl, domain), targetSolutionDescription),
      ];
  const traces = [
    hasMedicationVolume ? `${formatQuantity(medicationQuantity, domain)} ÷ ${formatVolumeMl(medicationMl)} = ${formatConcentration(availableQuantityPerMl, domain)}` : null,
    `${formatQuantity(medicationQuantity, domain)} ÷ ${formatConcentration(targetQuantityPerMl, domain)} = ${formatVolumeMl(finalMl)}`,
  ].filter(Boolean);

  return {
    ok: true,
    primary: formatVolumeMl(finalMl),
    instructions,
    finalLines: [
      bg.calculations.dilution.totalAmount(formatQuantity(medicationQuantity, domain)),
      bg.calculations.dilution.finalVolumeLine(formatVolumeMl(finalMl)),
      bg.calculations.dilution.finalConcentrationLine(formatConcentration(targetQuantityPerMl, domain)),
    ],
    notices,
    traces,
    warnings: [...(Number.isFinite(medicationMl) ? volumeWarnings(medicationMl) : []), ...highAlertWarning(input.highAlert)],
    label: {
      totalAmount: formatQuantity(medicationQuantity, domain),
      finalVolume: formatVolumeMl(finalMl),
      concentration: labelConcentration(targetQuantityPerMl, domain),
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

  const domain = compatibleQuantityDomain([input.sourceConcentrationUnit, input.targetConcentrationUnit]);

  if (!domain) {
    fieldErrors.push(
      { name: "sourceConcentrationUnit", message: bg.safety.incompatibleQuantityUnits },
      { name: "targetConcentrationUnit", message: bg.safety.incompatibleQuantityUnits },
    );
  }

  if (fieldErrors.length) {
    return { ok: false, errors: fieldErrors.map((field) => field.message), fieldErrors };
  }

  const sourceQuantityPerMl = directConcentrationToBasePerMl(input.sourceConcentration, input.sourceConcentrationUnit);
  const sourceMl = toMl(input.sourceVolume, input.sourceVolumeUnit);
  const targetQuantityPerMl = directConcentrationToBasePerMl(input.targetConcentration, input.targetConcentrationUnit);

  if (targetQuantityPerMl > sourceQuantityPerMl) {
    return {
      ok: false,
      errors: [bg.calculations.dilution.impossibleTarget],
      fieldErrors: [{ name: "targetConcentration", message: bg.calculations.dilution.impossibleTarget }],
    };
  }

  const finalMl = (sourceQuantityPerMl * sourceMl) / targetQuantityPerMl;
  const diluentMl = finalMl - sourceMl;
  const totalMedicationQuantity = sourceQuantityPerMl * sourceMl;
  const notices = [
    directQuantityConcentrationConversionTrace(input.sourceConcentration, input.sourceConcentrationUnit, domain),
    volumeConversionTrace(input.sourceVolume, input.sourceVolumeUnit, "mL"),
    directQuantityConcentrationConversionTrace(input.targetConcentration, input.targetConcentrationUnit, domain),
  ].filter(Boolean);

  return {
    ok: true,
    primary: formatVolumeMl(finalMl),
    instructions: [
      bg.calculations.dilution.useSourceSolution(formatVolumeMl(sourceMl), formatConcentration(sourceQuantityPerMl, domain)),
      bg.calculations.dilution.addDiluent(formatVolumeMl(diluentMl)),
      bg.calculations.dilution.finalVolume(formatVolumeMl(finalMl)),
      bg.calculations.dilution.finalConcentration(formatConcentration(targetQuantityPerMl, domain), concentrationDescription(input.targetConcentration, input.targetConcentrationUnit)),
    ],
    finalLines: [
      bg.calculations.dilution.sourceConcentrationLine(formatConcentration(sourceQuantityPerMl, domain)),
      bg.calculations.dilution.finalVolumeLine(formatVolumeMl(finalMl)),
      bg.calculations.dilution.finalConcentrationLine(formatConcentration(targetQuantityPerMl, domain)),
    ],
    notices,
    traces: [
      `${formatConcentration(sourceQuantityPerMl, domain)} × ${formatVolumeMl(sourceMl)} = ${formatQuantity(totalMedicationQuantity, domain)}`,
      `${formatQuantity(totalMedicationQuantity, domain)} ÷ ${formatConcentration(targetQuantityPerMl, domain)} = ${formatVolumeMl(finalMl)}`,
      `${formatVolumeMl(finalMl)} - ${formatVolumeMl(sourceMl)} = ${formatVolumeMl(diluentMl)}`,
    ],
    warnings: [...volumeWarnings(sourceMl), ...highAlertWarning(input.highAlert)],
    label: {
      totalAmount: formatQuantity(totalMedicationQuantity, domain),
      finalVolume: formatVolumeMl(finalMl),
      concentration: labelConcentration(targetQuantityPerMl, domain),
      recipe: bg.calculations.dilution.recipe(formatVolumeMl(sourceMl), formatVolumeMl(diluentMl)),
    },
  };
}

function concentrationDescription(value, unit) {
  return unit === "%" ? `${formatNumber(value)}% разтвор` : "";
}

function labelConcentration(value, domain) {
  return domain === "activity" ? formatConcentration(value, domain) : `${formatNumber(value)} mg/mL`;
}
