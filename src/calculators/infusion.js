import {
  formatConcentrationMgPerMl,
  formatMassMg,
  formatNumber,
  formatVolumeMl,
  formatVolumeNumber,
  formatVolumeRateMlPerHour,
  massConversionTrace,
  parseDecimal,
  toMg,
  toMl,
  volumeConversionTrace,
} from "../units/units.js";
import { highAlertWarning, validatePositiveFieldEntries } from "../safety/warnings.js";
import { bg } from "../i18n/bg.js";

export function calculateInfusionDoseRate(input) {
  const fields = [
    { name: "medicationAmount", label: bg.fields.medicationAmount, value: input.medicationAmount },
    { name: "finalVolume", label: bg.fields.finalVolume, value: input.finalVolume },
    { name: "prescribedRate", label: bg.fields.prescribedRate, value: input.prescribedRate },
  ];
  const hasHoursToRun = String(input.hoursToRun || "").trim() !== "";

  if (isWeightBasedRate(input.prescribedRateUnit)) {
    fields.push({ name: "patientWeight", label: bg.fields.patientWeight, value: input.patientWeight });
  }

  if (hasHoursToRun) {
    fields.push({ name: "hoursToRun", label: bg.fields.hoursToRun, value: input.hoursToRun });
  }

  const fieldErrors = validatePositiveFieldEntries(fields);

  if (fieldErrors.length) {
    return { ok: false, errors: fieldErrors.map((field) => field.message), fieldErrors };
  }

  const medicationMg = toMg(input.medicationAmount, input.medicationAmountUnit);
  const finalMl = toMl(input.finalVolume, input.finalVolumeUnit);
  const rate = rateToMgPerHour(input);
  const concentration = medicationMg / finalMl;
  const pumpRate = rate.mgPerHour / concentration;
  const volumeRate = hasHoursToRun ? volumeRateFromHours(finalMl, input.hoursToRun) : null;
  const notices = [
    massConversionTrace(input.medicationAmount, input.medicationAmountUnit, "mg"),
    volumeConversionTrace(input.finalVolume, input.finalVolumeUnit, "mL"),
    rate.notice,
  ].filter(Boolean);

  return {
    ok: true,
    primary: formatVolumeRateMlPerHour(pumpRate),
    instructions: [
      bg.calculations.infusion.concentration(formatConcentrationMgPerMl(concentration)),
      bg.calculations.infusion.setPump(formatVolumeNumber(pumpRate)),
      ...(volumeRate ? [bg.calculations.infusion.volumeRate(formatVolumeNumber(volumeRate.rate), formatNumber(volumeRate.hours))] : []),
    ],
    finalLines: [
      bg.calculations.infusion.amount(formatMassMg(medicationMg)),
      bg.calculations.infusion.finalVolume(formatVolumeMl(finalMl)),
      ...(rate.weightKg ? [bg.calculations.infusion.weight(formatNumber(rate.weightKg))] : []),
      bg.calculations.infusion.speed(formatNumber(rate.mgPerHour)),
      ...(volumeRate ? [bg.calculations.infusion.hoursToRun(formatNumber(volumeRate.hours))] : []),
    ],
    notices,
    traces: [
      `${formatMassMg(medicationMg)} ÷ ${formatVolumeMl(finalMl)} = ${formatConcentrationMgPerMl(concentration)}`,
      ...(rate.trace ? [rate.trace] : []),
      `${formatNumber(rate.mgPerHour)} mg/h ÷ ${formatConcentrationMgPerMl(concentration)} = ${formatVolumeRateMlPerHour(pumpRate)}`,
      ...(volumeRate ? [`${formatVolumeMl(finalMl)} ÷ ${formatNumber(volumeRate.hours)} h = ${formatVolumeRateMlPerHour(volumeRate.rate)}`] : []),
    ],
    warnings: highAlertWarning(input.highAlert),
    label: {
      totalAmount: formatMassMg(medicationMg),
      finalVolume: formatVolumeMl(finalMl),
      concentration: `${formatNumber(concentration)} mg/mL`,
      recipe: bg.calculations.infusion.doseRateRecipe(formatMassMg(medicationMg), formatVolumeMl(finalMl), formatVolumeNumber(pumpRate)),
    },
  };
}

function volumeRateFromHours(finalMl, hoursToRun) {
  const hours = parseDecimal(hoursToRun);
  return {
    hours,
    rate: finalMl / hours,
  };
}

function isWeightBasedRate(unit) {
  return unit?.includes("/kg/");
}

function rateToMgPerHour(input) {
  const prescribedRate = parseDecimal(input.prescribedRate);
  const unit = input.prescribedRateUnit;

  if (unit === "mg/h") {
    return { mgPerHour: prescribedRate };
  }

  if (unit === "µg/h") {
    const mgPerHour = toMg(prescribedRate, "µg");
    return {
      mgPerHour,
      notice: `${formatNumber(input.prescribedRate)} µg/h = ${formatNumber(mgPerHour)} mg/h`,
    };
  }

  const weightKg = parseDecimal(input.patientWeight);
  const isMicrogram = unit.startsWith("µg/");
  const isPerMinute = unit.endsWith("/min");
  const dosePerHour = prescribedRate * weightKg * (isPerMinute ? 60 : 1);
  const mgPerHour = isMicrogram ? toMg(dosePerHour, "µg") : dosePerHour;
  const timeMultiplier = isPerMinute ? " × 60 min/h" : "";
  const trace = `${formatNumber(input.prescribedRate)} ${unit} × ${formatNumber(weightKg)} kg${timeMultiplier} = ${formatNumber(mgPerHour)} mg/h`;

  return {
    mgPerHour,
    weightKg,
    trace,
    notice: isMicrogram ? trace : null,
  };
}

export function calculateInfusionVolumeTime(input) {
  const fieldErrors = validatePositiveFieldEntries([
    { name: "volume", label: bg.fields.volume, value: input.volume },
    { name: "time", label: bg.fields.time, value: input.time },
  ]);

  if (fieldErrors.length) {
    return { ok: false, errors: fieldErrors.map((field) => field.message), fieldErrors };
  }

  const volumeMl = toMl(input.volume, input.volumeUnit);
  const hours = input.timeUnit === "h" ? parseDecimal(input.time) : parseDecimal(input.time) / 60;
  const rate = volumeMl / hours;
  const notices = [
    volumeConversionTrace(input.volume, input.volumeUnit, "mL"),
    input.timeUnit === "min" ? `${formatNumber(input.time)} min = ${formatNumber(hours)} h` : null,
  ].filter(Boolean);

  return {
    ok: true,
    primary: formatVolumeRateMlPerHour(rate),
    instructions: [bg.calculations.infusion.setPump(formatVolumeNumber(rate))],
    finalLines: [bg.calculations.infusion.volume(formatVolumeMl(volumeMl)), bg.calculations.infusion.time(formatNumber(hours))],
    notices,
    traces: [`${formatVolumeMl(volumeMl)} ÷ ${formatNumber(hours)} h = ${formatVolumeRateMlPerHour(rate)}`],
    warnings: [],
    label: {
      totalAmount: "",
      finalVolume: formatVolumeMl(volumeMl),
      concentration: "",
      recipe: bg.calculations.infusion.volumeTimeRecipe(formatVolumeMl(volumeMl), formatNumber(hours), formatVolumeNumber(rate)),
    },
  };
}

export function calculateInfusionMedicationAmount(input) {
  const fieldErrors = validatePositiveFieldEntries([
    { name: "amountPatientWeight", label: bg.fields.patientWeight, value: input.amountPatientWeight },
    { name: "amountPrescribedRate", label: bg.fields.doseByWeight, value: input.amountPrescribedRate },
  ]);

  if (fieldErrors.length) {
    return { ok: false, errors: fieldErrors.map((field) => field.message), fieldErrors };
  }

  const weightKg = parseDecimal(input.amountPatientWeight);
  const dosePerKgPerMinute = parseDecimal(input.amountPrescribedRate);
  const dosePerMinute = dosePerKgPerMinute * weightKg;
  const totalDose = dosePerMinute * 60 * 24;
  const isMicrogram = input.amountPrescribedRateUnit.startsWith("µg/");
  const medicationMg = isMicrogram ? toMg(totalDose, "µg") : totalDose;
  const doseUnit = isMicrogram ? "µg" : "mg";

  return {
    ok: true,
    primary: formatMassMg(medicationMg),
    instructions: [
      bg.calculations.infusion.totalDose24(formatMassMg(medicationMg)),
      bg.calculations.infusion.useInDoseRateCalculator,
    ],
    finalLines: [
      bg.calculations.infusion.amount(formatMassMg(medicationMg)),
      bg.calculations.infusion.weight(formatNumber(weightKg)),
      bg.calculations.infusion.doseByWeightLine(`${formatNumber(dosePerKgPerMinute)} ${input.amountPrescribedRateUnit}`),
    ],
    notices: [],
    traces: [
      `${formatNumber(weightKg)} kg × ${formatNumber(dosePerKgPerMinute)} ${input.amountPrescribedRateUnit} = ${formatNumber(dosePerMinute)} ${doseUnit}/min`,
      `${formatNumber(dosePerMinute)} ${doseUnit}/min × 60 min/h × 24 h = ${formatNumber(totalDose)} ${doseUnit}${isMicrogram ? ` = ${formatMassMg(medicationMg)}` : ""}`,
    ],
    warnings: highAlertWarning(input.highAlert),
    carryForward: {
      targetMode: "doseRate",
      medicationAmountMg: medicationMg,
      patientWeightKg: weightKg,
    },
    label: {
      totalAmount: formatMassMg(medicationMg),
      finalVolume: "",
      concentration: "",
      recipe: bg.calculations.infusion.medicationAmountRecipe(formatMassMg(medicationMg)),
    },
  };
}
