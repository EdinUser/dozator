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

  if (fieldErrors.length) {
    return { ok: false, errors: fieldErrors.map((field) => field.message), fieldErrors };
  }

  const vialMg = toMg(input.vialAmount, input.vialAmountUnit);
  const diluentMl = hasDiluentVolume ? toMl(input.diluentVolume, input.diluentVolumeUnit) : null;
  const targetMgPerMl = hasTargetConcentration
    ? directConcentrationToMgPerMl(input.targetConcentration, input.targetConcentrationUnit)
    : null;
  const finalMl = hasFinalVolume ? toMl(input.finalVolume, input.finalVolumeUnit) : vialMg / targetMgPerMl;
  const concentration = vialMg / finalMl;
  const instructions = [
    ...(diluentMl !== null ? [bg.calculations.reconstitution.addDiluent(formatVolumeMl(diluentMl))] : []),
    hasFinalVolume
      ? bg.calculations.reconstitution.useFinalVolume(formatVolumeMl(finalMl))
      : bg.calculations.reconstitution.neededFinalVolume(formatVolumeMl(finalMl)),
    bg.calculations.reconstitution.resultingConcentration(formatConcentrationMgPerMl(concentration)),
    ...(hasTargetConcentration && !hasFinalVolume ? [bg.calculations.reconstitution.finalVolumeCaution] : []),
  ];
  const finalLines = [
    bg.calculations.reconstitution.vialAmount(formatMassMg(vialMg)),
    bg.calculations.reconstitution.finalVolume(formatVolumeMl(finalMl)),
    bg.calculations.reconstitution.concentration(formatConcentrationMgPerMl(concentration)),
  ];
  const traces = [`${formatMassMg(vialMg)} ÷ ${formatVolumeMl(finalMl)} = ${formatConcentrationMgPerMl(concentration)}`];
  const notices = [
    massConversionTrace(input.vialAmount, input.vialAmountUnit, "mg"),
    hasDiluentVolume ? volumeConversionTrace(input.diluentVolume, input.diluentVolumeUnit, "mL") : null,
    hasFinalVolume ? volumeConversionTrace(input.finalVolume, input.finalVolumeUnit, "mL") : null,
    hasTargetConcentration ? directConcentrationConversionTrace(input.targetConcentration, input.targetConcentrationUnit) : null,
  ].filter(Boolean);
  const warnings = highAlertWarning(input.highAlert);
  let primary = hasTargetConcentration && !hasFinalVolume ? formatVolumeMl(finalMl) : formatConcentrationMgPerMl(concentration);
  let recipe = diluentMl !== null
    ? bg.calculations.reconstitution.baseRecipe(formatVolumeMl(diluentMl), formatVolumeMl(finalMl))
    : bg.calculations.reconstitution.finalVolumeRecipe(formatVolumeMl(finalMl));

  if (hasRequiredDose) {
    const requiredMg = toMg(input.requiredDose, input.requiredDoseUnit);
    const withdrawMl = requiredMg / concentration;
    primary = formatVolumeMl(withdrawMl);
    instructions.push(bg.calculations.reconstitution.doseWithdraw(formatMassMg(requiredMg), formatVolumeMl(withdrawMl)));
    finalLines.push(bg.calculations.reconstitution.doseLine(formatMassMg(requiredMg)));
    traces.push(`${formatMassMg(requiredMg)} ÷ ${formatConcentrationMgPerMl(concentration)} = ${formatVolumeMl(withdrawMl)}`);
    notices.push(massConversionTrace(input.requiredDose, input.requiredDoseUnit, "mg"));
    warnings.push(...volumeWarnings(withdrawMl));
    recipe += ` ${bg.calculations.reconstitution.doseWithdraw(formatMassMg(requiredMg), formatVolumeMl(withdrawMl))}`;
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
      totalAmount: formatMassMg(vialMg),
      finalVolume: formatVolumeMl(finalMl),
      concentration: `${formatNumber(concentration)} mg/mL`,
      recipe,
    },
  };
}
