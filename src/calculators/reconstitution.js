import {
  compatibleQuantityDomain,
  directQuantityConcentrationConversionTrace,
  directConcentrationToBasePerMl,
  formatConcentration,
  formatQuantity,
  formatNumber,
  formatVolumeMl,
  quantityConversionTrace,
  toBaseQuantity,
  toMl,
  volumeConversionTrace,
} from "../units/units.js";
import { highAlertWarning, validatePositiveFieldEntries, volumeWarnings } from "../safety/warnings.js";
import { bg } from "../i18n/bg.js";

export function calculateReconstitution(input) {
  const hasRequiredDose = String(input.requiredDose || "").trim() !== "";
  const hasDiluentVolume = String(input.diluentVolume || "").trim() !== "";
  const hasFinalVolume = String(input.finalVolume || "").trim() !== "";
  const hasTargetConcentration = String(input.targetConcentration || "").trim() !== "";
  const fields = [
    { name: "vialAmount", label: bg.fields.vialAmount, value: input.vialAmount },
  ];

  if (hasDiluentVolume) {
    fields.push({ name: "diluentVolume", label: bg.fields.diluentAdded, value: input.diluentVolume });
  }

  if (hasFinalVolume) {
    fields.push({ name: "finalVolume", label: bg.fields.finalReconstitutedVolume, value: input.finalVolume });
  }

  if (hasTargetConcentration) {
    fields.push({ name: "targetConcentration", label: bg.fields.targetAmountPerMl, value: input.targetConcentration });
  }

  if (hasRequiredDose) {
    fields.push({ name: "requiredDose", label: bg.fields.prescribedDose, value: input.requiredDose });
  }

  const fieldErrors = validatePositiveFieldEntries(fields);

  if (!hasFinalVolume && !hasTargetConcentration) {
    const error = bg.calculations.reconstitution.missingVolumeOrTarget;
    fieldErrors.push(
      { name: "finalVolume", label: bg.fields.finalReconstitutedVolume, message: error },
      { name: "targetConcentration", label: bg.fields.targetAmountPerMl, message: error },
    );
  }

  const quantityUnits = [
    input.vialAmountUnit,
    ...(hasTargetConcentration ? [input.targetConcentrationUnit] : []),
    ...(hasRequiredDose ? [input.requiredDoseUnit] : []),
  ];
  const domain = compatibleQuantityDomain(quantityUnits);

  if (!domain) {
    fieldErrors.push(
      { name: "vialAmountUnit", message: bg.safety.incompatibleQuantityUnits },
      ...(hasTargetConcentration ? [{ name: "targetConcentrationUnit", message: bg.safety.incompatibleQuantityUnits }] : []),
      ...(hasRequiredDose ? [{ name: "requiredDoseUnit", message: bg.safety.incompatibleQuantityUnits }] : []),
    );
  }

  if (fieldErrors.length) {
    return { ok: false, errors: fieldErrors.map((field) => field.message), fieldErrors };
  }

  const vialQuantity = toBaseQuantity(input.vialAmount, input.vialAmountUnit);
  const diluentMl = hasDiluentVolume ? toMl(input.diluentVolume, input.diluentVolumeUnit) : null;
  const targetQuantityPerMl = hasTargetConcentration
    ? directConcentrationToBasePerMl(input.targetConcentration, input.targetConcentrationUnit)
    : null;
  const finalMl = hasFinalVolume ? toMl(input.finalVolume, input.finalVolumeUnit) : vialQuantity / targetQuantityPerMl;
  const concentration = vialQuantity / finalMl;
  const instructions = [
    ...(diluentMl !== null ? [bg.calculations.reconstitution.addDiluent(formatVolumeMl(diluentMl))] : []),
    hasFinalVolume
      ? bg.calculations.reconstitution.useFinalVolume(formatVolumeMl(finalMl))
      : bg.calculations.reconstitution.neededFinalVolume(formatVolumeMl(finalMl)),
    bg.calculations.reconstitution.resultingConcentration(formatConcentration(concentration, domain)),
    ...(hasTargetConcentration && !hasFinalVolume ? [bg.calculations.reconstitution.finalVolumeCaution] : []),
  ];
  const finalLines = [
    bg.calculations.reconstitution.vialAmount(formatQuantity(vialQuantity, domain)),
    bg.calculations.reconstitution.finalVolume(formatVolumeMl(finalMl)),
    bg.calculations.reconstitution.concentration(formatConcentration(concentration, domain)),
  ];
  const traces = [`${formatQuantity(vialQuantity, domain)} ÷ ${formatVolumeMl(finalMl)} = ${formatConcentration(concentration, domain)}`];
  const notices = [
    quantityConversionTrace(input.vialAmount, input.vialAmountUnit, domain),
    hasDiluentVolume ? volumeConversionTrace(input.diluentVolume, input.diluentVolumeUnit, "mL") : null,
    hasFinalVolume ? volumeConversionTrace(input.finalVolume, input.finalVolumeUnit, "mL") : null,
    hasTargetConcentration ? directQuantityConcentrationConversionTrace(input.targetConcentration, input.targetConcentrationUnit, domain) : null,
  ].filter(Boolean);
  const warnings = highAlertWarning(input.highAlert);
  let primary = hasTargetConcentration && !hasFinalVolume ? formatVolumeMl(finalMl) : formatConcentration(concentration, domain);
  let recipe = diluentMl !== null
    ? bg.calculations.reconstitution.baseRecipe(formatVolumeMl(diluentMl), formatVolumeMl(finalMl))
    : bg.calculations.reconstitution.finalVolumeRecipe(formatVolumeMl(finalMl));

  if (hasRequiredDose) {
    const requiredQuantity = toBaseQuantity(input.requiredDose, input.requiredDoseUnit);
    const withdrawMl = requiredQuantity / concentration;
    primary = formatVolumeMl(withdrawMl);
    instructions.push(bg.calculations.reconstitution.doseWithdraw(formatQuantity(requiredQuantity, domain), formatVolumeMl(withdrawMl)));
    finalLines.push(bg.calculations.reconstitution.doseLine(formatQuantity(requiredQuantity, domain)));
    traces.push(`${formatQuantity(requiredQuantity, domain)} ÷ ${formatConcentration(concentration, domain)} = ${formatVolumeMl(withdrawMl)}`);
    notices.push(quantityConversionTrace(input.requiredDose, input.requiredDoseUnit, domain));
    warnings.push(...volumeWarnings(withdrawMl));
    recipe += ` ${bg.calculations.reconstitution.doseWithdraw(formatQuantity(requiredQuantity, domain), formatVolumeMl(withdrawMl))}`;
  }

  return {
    ok: true,
    primary,
    instructions,
    finalLines,
    notices: notices.filter(Boolean),
    traces,
    warnings,
    label: {
      totalAmount: formatQuantity(vialQuantity, domain),
      finalVolume: formatVolumeMl(finalMl),
      concentration: domain === "activity" ? formatConcentration(concentration, domain) : `${formatNumber(concentration)} mg/mL`,
      recipe,
    },
  };
}
