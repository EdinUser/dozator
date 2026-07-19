import {
  concentrationToMgPerMl,
  concentrationConversionTrace,
  directConcentrationConversionTrace,
  directConcentrationToMgPerMl,
  formatConcentrationMgPerMl,
  formatMassMg,
  formatNumber,
  formatVolumeMl,
  toMl,
  volumeConversionTrace,
} from "../units/units.js";
import { highAlertWarning, validatePositiveFieldEntries, volumeWarnings } from "../safety/warnings.js";
import { bg } from "../i18n/bg.js";

export function calculateDilution(input) {
  if (isLegacyDilutionInput(input)) {
    return calculateLegacyDilution(input);
  }

  const mode = input.mode || "prepareFinalVolume";
  const fields = [
    { name: "availableConcentration", label: bg.fields.availableConcentration, value: input.availableConcentration },
    { name: "targetConcentration", label: bg.fields.targetConcentration, value: input.targetConcentration },
  ];

  if (mode === "diluteAvailableAmount") {
    fields.push({ name: "stockVolume", label: bg.fields.stockVolume, value: input.stockVolume });
  } else {
    fields.push({ name: "finalVolume", label: bg.fields.finalVolume, value: input.finalVolume });
  }

  const fieldErrors = validatePositiveFieldEntries(fields);

  if (fieldErrors.length) {
    return { ok: false, errors: fieldErrors.map((field) => field.message), fieldErrors };
  }

  const availableMgPerMl = directConcentrationToMgPerMl(input.availableConcentration, input.availableConcentrationUnit);
  const targetMgPerMl = directConcentrationToMgPerMl(input.targetConcentration, input.targetConcentrationUnit);

  if (targetMgPerMl > availableMgPerMl) {
    return targetTooHighError(["targetConcentration"]);
  }

  return mode === "diluteAvailableAmount"
    ? calculateDiluteAvailableAmount(input, availableMgPerMl, targetMgPerMl)
    : calculatePrepareFinalVolume(input, availableMgPerMl, targetMgPerMl);
}

function calculatePrepareFinalVolume(input, availableMgPerMl, targetMgPerMl) {
  const finalMl = toMl(input.finalVolume, input.finalVolumeUnit);
  const medicationMl = (targetMgPerMl * finalMl) / availableMgPerMl;
  const diluentMl = finalMl - medicationMl;
  const totalMg = targetMgPerMl * finalMl;
  const notices = directConcentrationNotices(input);

  return dilutionResult({
    primary: formatVolumeMl(medicationMl),
    highAlert: input.highAlert,
    medicationMl,
    diluentMl,
    finalMl,
    totalMg,
    targetMgPerMl,
    availableMgPerMl,
    notices,
    traces: [
      `${formatConcentrationMgPerMl(targetMgPerMl)} × ${formatVolumeMl(finalMl)} = ${formatMassMg(totalMg)}`,
      `${formatMassMg(totalMg)} ÷ ${formatConcentrationMgPerMl(availableMgPerMl)} = ${formatVolumeMl(medicationMl)}`,
    ],
  });
}

function calculateDiluteAvailableAmount(input, availableMgPerMl, targetMgPerMl) {
  const medicationMl = toMl(input.stockVolume, input.stockVolumeUnit);
  const totalMg = availableMgPerMl * medicationMl;
  const finalMl = totalMg / targetMgPerMl;
  const diluentMl = finalMl - medicationMl;
  const notices = [
    ...directConcentrationNotices(input),
    volumeConversionTrace(input.stockVolume, input.stockVolumeUnit, "mL"),
  ].filter(Boolean);

  return dilutionResult({
    primary: formatVolumeMl(finalMl),
    highAlert: input.highAlert,
    medicationMl,
    diluentMl,
    finalMl,
    totalMg,
    targetMgPerMl,
    availableMgPerMl,
    notices,
    traces: [
      `${formatConcentrationMgPerMl(availableMgPerMl)} × ${formatVolumeMl(medicationMl)} = ${formatMassMg(totalMg)}`,
      `${formatMassMg(totalMg)} ÷ ${formatConcentrationMgPerMl(targetMgPerMl)} = ${formatVolumeMl(finalMl)}`,
    ],
  });
}

function dilutionResult({ primary, highAlert, medicationMl, diluentMl, finalMl, totalMg, targetMgPerMl, notices, traces }) {
  return {
    ok: true,
    primary,
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
    traces,
    warnings: [...volumeWarnings(medicationMl), ...highAlertWarning(highAlert)],
    label: {
      totalAmount: formatMassMg(totalMg),
      finalVolume: formatVolumeMl(finalMl),
      concentration: `${formatNumber(targetMgPerMl)} mg/mL`,
      recipe: bg.calculations.dilution.recipe(formatVolumeMl(medicationMl), formatVolumeMl(diluentMl)),
    },
  };
}

function directConcentrationNotices(input) {
  return [
    directConcentrationConversionTrace(input.availableConcentration, input.availableConcentrationUnit),
    directConcentrationConversionTrace(input.targetConcentration, input.targetConcentrationUnit),
    input.finalVolume ? volumeConversionTrace(input.finalVolume, input.finalVolumeUnit, "mL") : null,
  ].filter(Boolean);
}

function targetTooHighError(fields) {
  return {
    ok: false,
    errors: [bg.calculations.dilution.impossibleTarget],
    fieldErrors: fields.map((name) => ({ name, message: bg.calculations.dilution.impossibleTarget })),
  };
}

function isLegacyDilutionInput(input) {
  return "availableAmount" in input || "targetAmount" in input || "targetVolume" in input;
}

function calculateLegacyDilution(input) {
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
    return targetTooHighError(["targetAmount", "targetVolume"]);
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
