import { formatConcentrationMgPerMl, formatMassMg, formatNumber, formatVolumeMl, massConversionTrace, parseDecimal, toMg, toMl, volumeConversionTrace } from "../units/units.js";
import { highAlertWarning, validatePositiveFields } from "../safety/warnings.js";

export function calculateInfusionDoseRate(input) {
  const errors = validatePositiveFields([
    { label: "Количество лекарство", value: input.medicationAmount },
    { label: "Краен обем", value: input.finalVolume },
    { label: "Назначена скорост", value: input.prescribedRate },
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
    instructions: [`Концентрация в инфузията: ${formatConcentrationMgPerMl(concentration)}.`, `Настройте помпата на ${formatNumber(pumpRate)} mL/h.`],
    finalLines: [`Количество: ${formatMassMg(medicationMg)}`, `Краен обем: ${formatVolumeMl(finalMl)}`, `Скорост: ${formatNumber(rateMgPerHour)} mg/h`],
    notices,
    traces: [`${formatMassMg(medicationMg)} ÷ ${formatVolumeMl(finalMl)} = ${formatConcentrationMgPerMl(concentration)}`, `${formatNumber(rateMgPerHour)} mg/h ÷ ${formatConcentrationMgPerMl(concentration)} = ${formatNumber(pumpRate)} mL/h`],
    warnings: highAlertWarning(input.highAlert),
    label: {
      totalAmount: formatMassMg(medicationMg),
      finalVolume: formatVolumeMl(finalMl),
      concentration: `${formatNumber(concentration)} mg/mL`,
      recipe: `Пригответе ${formatMassMg(medicationMg)} в краен обем ${formatVolumeMl(finalMl)}. Настройте помпата на ${formatNumber(pumpRate)} mL/h.`,
    },
  };
}

export function calculateInfusionVolumeTime(input) {
  const errors = validatePositiveFields([
    { label: "Обем", value: input.volume },
    { label: "Време", value: input.time },
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
    instructions: [`Настройте помпата на ${formatNumber(rate)} mL/h.`],
    finalLines: [`Обем: ${formatVolumeMl(volumeMl)}`, `Време: ${formatNumber(hours)} h`],
    notices,
    traces: [`${formatVolumeMl(volumeMl)} ÷ ${formatNumber(hours)} h = ${formatNumber(rate)} mL/h`],
    warnings: [],
    label: {
      totalAmount: "",
      finalVolume: formatVolumeMl(volumeMl),
      concentration: "",
      recipe: `Инфузирайте ${formatVolumeMl(volumeMl)} за ${formatNumber(hours)} h при ${formatNumber(rate)} mL/h.`,
    },
  };
}
