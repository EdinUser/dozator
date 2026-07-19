import { formatConcentrationMgPerMl, formatMassMg, formatNumber, formatVolumeMl, massConversionTrace, parseDecimal, toMg, toMl, volumeConversionTrace } from "../units/units.js";
import { highAlertWarning, validatePositiveFields } from "../safety/warnings.js";
import { bg } from "../i18n/bg.js";

export function calculateInfusionDoseRate(input) {
  const errors = validatePositiveFields([
    { label: bg.fields.medicationAmount, value: input.medicationAmount },
    { label: bg.fields.finalVolume, value: input.finalVolume },
    { label: bg.fields.prescribedRate, value: input.prescribedRate },
  ]);

  if (errors.length) {
    return { ok: false, errors };
  }

  const medicationMg = toMg(input.medicationAmount, input.medicationAmountUnit);
  const finalMl = toMl(input.finalVolume, input.finalVolumeUnit);
  const rateMgPerHour = input.prescribedRateUnit === "mg/h" ? parseDecimal(input.prescribedRate) : toMg(input.prescribedRate, "µg");
  const concentration = medicationMg / finalMl;
  const pumpRate = rateMgPerHour / concentration;
  const notices = [
    massConversionTrace(input.medicationAmount, input.medicationAmountUnit, "mg"),
    volumeConversionTrace(input.finalVolume, input.finalVolumeUnit, "mL"),
    input.prescribedRateUnit === "µg/h" ? `${formatNumber(input.prescribedRate)} µg/h = ${formatNumber(rateMgPerHour)} mg/h` : null,
  ].filter(Boolean);

  return {
    ok: true,
    primary: `${formatNumber(pumpRate)} mL/h`,
    instructions: [bg.calculations.infusion.concentration(formatConcentrationMgPerMl(concentration)), bg.calculations.infusion.setPump(formatNumber(pumpRate))],
    finalLines: [
      bg.calculations.infusion.amount(formatMassMg(medicationMg)),
      bg.calculations.infusion.finalVolume(formatVolumeMl(finalMl)),
      bg.calculations.infusion.speed(formatNumber(rateMgPerHour)),
    ],
    notices,
    traces: [`${formatMassMg(medicationMg)} ÷ ${formatVolumeMl(finalMl)} = ${formatConcentrationMgPerMl(concentration)}`, `${formatNumber(rateMgPerHour)} mg/h ÷ ${formatConcentrationMgPerMl(concentration)} = ${formatNumber(pumpRate)} mL/h`],
    warnings: highAlertWarning(input.highAlert),
    label: {
      totalAmount: formatMassMg(medicationMg),
      finalVolume: formatVolumeMl(finalMl),
      concentration: `${formatNumber(concentration)} mg/mL`,
      recipe: bg.calculations.infusion.doseRateRecipe(formatMassMg(medicationMg), formatVolumeMl(finalMl), formatNumber(pumpRate)),
    },
  };
}

export function calculateInfusionVolumeTime(input) {
  const errors = validatePositiveFields([
    { label: bg.fields.volume, value: input.volume },
    { label: bg.fields.time, value: input.time },
  ]);

  if (errors.length) {
    return { ok: false, errors };
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
    primary: `${formatNumber(rate)} mL/h`,
    instructions: [bg.calculations.infusion.setPump(formatNumber(rate))],
    finalLines: [bg.calculations.infusion.volume(formatVolumeMl(volumeMl)), bg.calculations.infusion.time(formatNumber(hours))],
    notices,
    traces: [`${formatVolumeMl(volumeMl)} ÷ ${formatNumber(hours)} h = ${formatNumber(rate)} mL/h`],
    warnings: [],
    label: {
      totalAmount: "",
      finalVolume: formatVolumeMl(volumeMl),
      concentration: "",
      recipe: bg.calculations.infusion.volumeTimeRecipe(formatVolumeMl(volumeMl), formatNumber(hours), formatNumber(rate)),
    },
  };
}
