import { formatConcentrationMgPerMl, formatMassMg, formatNumber, formatVolumeMl, massConversionTrace, toMg, toMl, volumeConversionTrace } from "../units/units.js";
import { highAlertWarning, validatePositiveFields, volumeWarnings } from "../safety/warnings.js";
import { bg } from "../i18n/bg.js";

export function calculateReconstitution(input) {
  const hasRequiredDose = String(input.requiredDose || "").trim() !== "";
  const fields = [
    { label: bg.fields.vialAmount, value: input.vialAmount },
    { label: bg.fields.diluentAdded, value: input.diluentVolume },
    { label: bg.fields.finalReconstitutedVolume, value: input.finalVolume },
  ];

  if (hasRequiredDose) {
    fields.push({ label: bg.fields.prescribedDose, value: input.requiredDose });
  }

  const errors = validatePositiveFields(fields);

  if (errors.length) {
    return { ok: false, errors };
  }

  const vialMg = toMg(input.vialAmount, input.vialAmountUnit);
  const diluentMl = toMl(input.diluentVolume, input.diluentVolumeUnit);
  const finalMl = toMl(input.finalVolume, input.finalVolumeUnit);
  const concentration = vialMg / finalMl;
  const instructions = [
    bg.calculations.reconstitution.addDiluent(formatVolumeMl(diluentMl)),
    bg.calculations.reconstitution.useFinalVolume(formatVolumeMl(finalMl)),
    bg.calculations.reconstitution.resultingConcentration(formatConcentrationMgPerMl(concentration)),
  ];
  const finalLines = [
    bg.calculations.reconstitution.vialAmount(formatMassMg(vialMg)),
    bg.calculations.reconstitution.finalVolume(formatVolumeMl(finalMl)),
    bg.calculations.reconstitution.concentration(formatConcentrationMgPerMl(concentration)),
  ];
  const traces = [`${formatMassMg(vialMg)} ÷ ${formatVolumeMl(finalMl)} = ${formatConcentrationMgPerMl(concentration)}`];
  const notices = [
    massConversionTrace(input.vialAmount, input.vialAmountUnit, "mg"),
    volumeConversionTrace(input.diluentVolume, input.diluentVolumeUnit, "mL"),
    volumeConversionTrace(input.finalVolume, input.finalVolumeUnit, "mL"),
  ].filter(Boolean);
  const warnings = highAlertWarning(input.highAlert);
  let primary = formatConcentrationMgPerMl(concentration);
  let recipe = bg.calculations.reconstitution.baseRecipe(formatVolumeMl(diluentMl), formatVolumeMl(finalMl));

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
