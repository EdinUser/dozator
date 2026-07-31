import {
  compatibleQuantityDomain,
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

export function calculateDose(input) {
  const fieldErrors = validatePositiveFieldEntries([
    { name: "requiredDose", label: bg.fields.prescribedDose, value: input.requiredDose },
    { name: "availableAmount", label: bg.fields.availableAmount, value: input.availableAmount },
    { name: "availableVolume", label: bg.fields.availableVolume, value: input.availableVolume },
  ]);

  const domain = compatibleQuantityDomain([input.requiredDoseUnit, input.availableAmountUnit]);

  if (!domain) {
    fieldErrors.push(
      { name: "requiredDoseUnit", message: bg.safety.incompatibleQuantityUnits },
      { name: "availableAmountUnit", message: bg.safety.incompatibleQuantityUnits },
    );
  }

  if (fieldErrors.length) {
    return { ok: false, errors: fieldErrors.map((field) => field.message), fieldErrors };
  }

  const requiredQuantity = toBaseQuantity(input.requiredDose, input.requiredDoseUnit);
  const availableQuantityPerMl = toBaseQuantity(input.availableAmount, input.availableAmountUnit) / toMl(input.availableVolume, input.availableVolumeUnit);
  const withdrawMl = requiredQuantity / availableQuantityPerMl;

  const traces = [
    `${formatQuantity(requiredQuantity, domain)} ÷ ${formatConcentration(availableQuantityPerMl, domain)} = ${formatVolumeMl(withdrawMl)}`,
  ];
  const notices = [
    quantityConversionTrace(input.requiredDose, input.requiredDoseUnit, domain),
    quantityConversionTrace(input.availableAmount, input.availableAmountUnit, domain),
    volumeConversionTrace(input.availableVolume, input.availableVolumeUnit, "mL"),
  ].filter(Boolean);

  return {
    ok: true,
    primary: formatVolumeMl(withdrawMl),
    instructions: [bg.calculations.dose.withdraw(formatVolumeMl(withdrawMl)), bg.calculations.dose.contains(formatQuantity(requiredQuantity, domain))],
    finalLines: [bg.calculations.dose.finalDose(formatQuantity(requiredQuantity, domain))],
    notices,
    traces,
    warnings: [...volumeWarnings(withdrawMl), ...highAlertWarning(input.highAlert)],
    label: {
      totalAmount: formatQuantity(requiredQuantity, domain),
      finalVolume: formatVolumeMl(withdrawMl),
      concentration: domain === "activity" ? formatConcentration(availableQuantityPerMl, domain) : `${formatNumber(availableQuantityPerMl)} mg/mL`,
      recipe: bg.calculations.dose.withdraw(formatVolumeMl(withdrawMl)),
    },
  };
}
