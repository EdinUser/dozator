import { parseDecimal } from "../units/units.js";
import { bg } from "../i18n/bg.js";

export function validatePositiveFields(fields) {
  return validatePositiveFieldEntries(fields).map((field) => field.message);
}

export function validatePositiveFieldEntries(fields) {
  return fields
    .filter((field) => !Number.isFinite(parseDecimal(field.value)) || parseDecimal(field.value) <= 0)
    .map((field) => ({
      name: field.name,
      label: field.label,
      message: bg.safety.positiveField(field.label),
    }));
}

export function volumeWarnings(volumeMl) {
  const warnings = [];

  if (volumeMl > 0 && volumeMl < 0.1) {
    warnings.push(bg.safety.smallVolume);
  }

  return warnings;
}

export function highAlertWarning(enabled) {
  if (!enabled) {
    return [];
  }

  return [bg.safety.highAlert];
}
