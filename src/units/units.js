const MASS_FACTORS_TO_MG = {
  g: 1000,
  mg: 1,
  "µg": 0.001,
};

const VOLUME_FACTORS_TO_ML = {
  L: 1000,
  mL: 1,
};

export const massUnits = Object.keys(MASS_FACTORS_TO_MG);
export const activityUnits = ["IU"];
export const quantityUnits = [...massUnits, ...activityUnits];
export const volumeUnits = Object.keys(VOLUME_FACTORS_TO_ML);
export const timeUnits = ["min", "h"];
export const concentrationUnits = ["mg/mL", "µg/mL", "IU/mL", "%"];

export function parseDecimal(value) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return Number.NaN;
  }

  const normalized = value.trim().replace(",", ".");

  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    return Number.NaN;
  }

  return Number(normalized);
}

export function toMg(value, unit) {
  return parseDecimal(value) * MASS_FACTORS_TO_MG[unit];
}

export function fromMg(value, unit) {
  return parseDecimal(value) / MASS_FACTORS_TO_MG[unit];
}

export function toMl(value, unit) {
  return parseDecimal(value) * VOLUME_FACTORS_TO_ML[unit];
}

export function fromMl(value, unit) {
  return parseDecimal(value) / VOLUME_FACTORS_TO_ML[unit];
}

export function massConversionTrace(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) {
    return null;
  }

  return `${formatNumber(value)} ${fromUnit} = ${formatNumber(fromMg(toMg(value, fromUnit), toUnit))} ${toUnit}`;
}

export function quantityUnitDomain(unit) {
  if (massUnits.includes(unit)) {
    return "mass";
  }

  if (activityUnits.includes(unit)) {
    return "activity";
  }

  return null;
}

export function concentrationUnitDomain(unit) {
  if (unit === "mg/mL" || unit === "µg/mL" || unit === "%") {
    return "mass";
  }

  if (unit === "IU/mL") {
    return "activity";
  }

  return null;
}

export function compatibleQuantityDomain(units) {
  const domains = units.map((unit) => quantityUnitDomain(unit) || concentrationUnitDomain(unit));
  const uniqueDomains = [...new Set(domains)];

  return uniqueDomains.length === 1 ? uniqueDomains[0] : null;
}

export function toBaseQuantity(value, unit) {
  if (quantityUnitDomain(unit) === "activity") {
    return parseDecimal(value);
  }

  return toMg(value, unit);
}

export function formatQuantity(value, domain) {
  if (domain === "activity") {
    return `${formatNumber(value)} IU`;
  }

  return formatMassMg(value);
}

export function formatConcentration(value, domain) {
  if (domain === "activity") {
    return `${formatNumber(value)} IU/mL`;
  }

  return formatConcentrationMgPerMl(value);
}

export function quantityConversionTrace(value, fromUnit, domain, toUnit = "mg") {
  if (domain === "activity") {
    return null;
  }

  return massConversionTrace(value, fromUnit, toUnit);
}

export function concentrationConversionTrace(amount, amountUnit, volume, volumeUnit, toAmountUnit = "mg", toVolumeUnit = "mL") {
  const amountTrace = massConversionTrace(amount, amountUnit, toAmountUnit);
  const volumeTrace = volumeConversionTrace(volume, volumeUnit, toVolumeUnit);

  return [amountTrace, volumeTrace].filter(Boolean);
}

export function volumeConversionTrace(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) {
    return null;
  }

  return `${formatVolumeValue(value, fromUnit)} ${fromUnit} = ${formatVolumeValue(fromMl(toMl(value, fromUnit), toUnit), toUnit)} ${toUnit}`;
}

export function concentrationToMgPerMl(amount, amountUnit, volume, volumeUnit) {
  return toMg(amount, amountUnit) / toMl(volume, volumeUnit);
}

export function directConcentrationToMgPerMl(value, unit) {
  const concentration = parseDecimal(value);

  if (unit === "mg/mL") {
    return concentration;
  }

  if (unit === "µg/mL") {
    return concentration * 0.001;
  }

  if (unit === "%") {
    return concentration * 10;
  }

  return Number.NaN;
}

export function directConcentrationToBasePerMl(value, unit) {
  if (concentrationUnitDomain(unit) === "activity") {
    return parseDecimal(value);
  }

  return directConcentrationToMgPerMl(value, unit);
}

export function directConcentrationConversionTrace(value, unit) {
  const concentration = directConcentrationToMgPerMl(value, unit);

  if (unit === "mg/mL" || !Number.isFinite(concentration)) {
    return null;
  }

  return `${formatNumber(value)} ${unit} = ${formatNumber(concentration)} mg/mL`;
}

export function directQuantityConcentrationConversionTrace(value, unit, domain) {
  if (domain === "activity") {
    return null;
  }

  return directConcentrationConversionTrace(value, unit);
}

export function formatNumber(value, maximumFractionDigits = 6) {
  const number = parseDecimal(value);

  if (!Number.isFinite(number)) {
    return "";
  }

  const rounded = Number.parseFloat(number.toFixed(maximumFractionDigits));
  return rounded.toLocaleString("en-US", {
    maximumFractionDigits,
    useGrouping: false,
  });
}

export function formatVolumeMl(value) {
  return `${formatVolumeNumber(value)} mL`;
}

export function formatVolumeRateMlPerHour(value) {
  return `${formatVolumeNumber(value)} mL/h`;
}

export function formatVolumeNumber(value) {
  return formatNumber(value, volumeFractionDigits(value));
}

export function formatMassMg(value) {
  if (Math.abs(value) >= 1000) {
    return `${formatNumber(value / 1000)} g`;
  }

  if (Math.abs(value) < 1 && value !== 0) {
    return `${formatNumber(value * 1000)} µg`;
  }

  return `${formatNumber(value)} mg`;
}

export function formatConcentrationMgPerMl(value) {
  if (Math.abs(value) < 1 && value !== 0) {
    return `${formatNumber(value * 1000)} µg/mL`;
  }

  return `${formatNumber(value)} mg/mL`;
}

function formatVolumeValue(value, unit) {
  return formatNumber(value, unit === "mL" ? volumeFractionDigits(value) : 6);
}

function volumeFractionDigits(value) {
  const number = parseDecimal(value);
  return Math.abs(number) < 0.1 && number !== 0 ? 3 : 2;
}
