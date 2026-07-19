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
export const volumeUnits = Object.keys(VOLUME_FACTORS_TO_ML);
export const timeUnits = ["min", "h"];
export const concentrationUnits = ["mg/mL", "µg/mL", "units/mL", "%"];

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

export function concentrationConversionTrace(amount, amountUnit, volume, volumeUnit, toAmountUnit = "mg", toVolumeUnit = "mL") {
  const amountTrace = massConversionTrace(amount, amountUnit, toAmountUnit);
  const volumeTrace = volumeConversionTrace(volume, volumeUnit, toVolumeUnit);

  return [amountTrace, volumeTrace].filter(Boolean);
}

export function volumeConversionTrace(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) {
    return null;
  }

  return `${formatNumber(value)} ${fromUnit} = ${formatNumber(fromMl(toMl(value, fromUnit), toUnit))} ${toUnit}`;
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

export function directConcentrationConversionTrace(value, unit) {
  const concentration = directConcentrationToMgPerMl(value, unit);

  if (unit === "mg/mL" || !Number.isFinite(concentration)) {
    return null;
  }

  return `${formatNumber(value)} ${unit} = ${formatNumber(concentration)} mg/mL`;
}

export function formatNumber(value) {
  const number = parseDecimal(value);

  if (!Number.isFinite(number)) {
    return "";
  }

  const rounded = Number.parseFloat(number.toFixed(6));
  return rounded.toLocaleString("en-US", {
    maximumFractionDigits: 6,
    useGrouping: false,
  });
}

export function formatVolumeMl(value) {
  return `${formatNumber(value)} mL`;
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
