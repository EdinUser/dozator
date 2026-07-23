const shareVersion = 1;
const sharePrefix = "calc=";
const shareFields = {
  dose: ["requiredDose", "requiredDoseUnit", "availableAmount", "availableAmountUnit", "availableVolume", "availableVolumeUnit", "highAlert"],
  dilution: [
    "mode",
    "availableAmount",
    "availableAmountUnit",
    "availableVolume",
    "availableVolumeUnit",
    "sourceConcentration",
    "sourceConcentrationUnit",
    "sourceVolume",
    "sourceVolumeUnit",
    "targetConcentration",
    "targetConcentrationUnit",
    "highAlert",
  ],
  reconstitution: [
    "vialAmount",
    "vialAmountUnit",
    "diluentVolume",
    "diluentVolumeUnit",
    "finalVolume",
    "finalVolumeUnit",
    "targetConcentration",
    "targetConcentrationUnit",
    "requiredDose",
    "requiredDoseUnit",
    "highAlert",
  ],
  infusion: [
    "mode",
    "medicationAmount",
    "medicationAmountUnit",
    "finalVolume",
    "finalVolumeUnit",
    "patientWeight",
    "patientWeightUnit",
    "amountPatientWeight",
    "amountPatientWeightUnit",
    "prescribedRate",
    "prescribedRateUnit",
    "amountPrescribedRate",
    "amountPrescribedRateUnit",
    "hoursToRun",
    "hoursToRunUnit",
    "volume",
    "volumeUnit",
    "time",
    "timeUnit",
    "highAlert",
  ],
};

export function buildShareUrl(calculatorKey, values) {
  const url = new URL(window.location.href);
  url.hash = `${sharePrefix}${encodePayload({
    v: shareVersion,
    calculator: calculatorKey,
    values: shareableValues(calculatorKey, values),
  })}`;
  return url.toString();
}

export function readSharedCalculation(hashValue = window.location.hash) {
  const hash = hashValue.replace(/^#/, "");

  if (!hash.startsWith(sharePrefix)) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeURIComponent(atob(hash.slice(sharePrefix.length))));

    if (payload.v !== shareVersion || !payload.calculator || !payload.values) {
      return null;
    }

    return {
      ...payload,
      values: shareableValues(payload.calculator, payload.values),
    };
  } catch {
    return null;
  }
}

function encodePayload(payload) {
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

export function shareableValues(calculatorKey, values) {
  return Object.fromEntries((shareFields[calculatorKey] || []).filter((field) => field in values).map((field) => [field, values[field]]));
}
