import { parseDecimal } from "../units/units.js";

export function validatePositiveFields(fields) {
  return fields
    .filter((field) => !Number.isFinite(parseDecimal(field.value)) || parseDecimal(field.value) <= 0)
    .map((field) => `${field.label} трябва да бъде положително число.`);
}

export function volumeWarnings(volumeMl) {
  const warnings = [];

  if (volumeMl > 0 && volumeMl < 0.1) {
    warnings.push("Изчисленият обем е под 0.1 mL и може да не бъде измерим точно с избраната спринцовка.");
  }

  return warnings;
}

export function highAlertWarning(enabled) {
  if (!enabled) {
    return [];
  }

  return [
    "High-alert медикамент: проверете назначението, концентрацията на продукта, болничния протокол и изчислението независимо.",
  ];
}
