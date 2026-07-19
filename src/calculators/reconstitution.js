import { formatConcentrationMgPerMl, formatMassMg, formatNumber, formatVolumeMl, massConversionTrace, toMg, toMl, volumeConversionTrace } from "../units/units.js";
import { highAlertWarning, validatePositiveFields, volumeWarnings } from "../safety/warnings.js";

export function calculateReconstitution(input) {
  const fields = [
    { label: "Количество във флакона", value: input.vialAmount },
    { label: "Добавен разтворител", value: input.diluentVolume },
    { label: "Краен разтворен обем", value: input.finalVolume },
  ];

  if (input.requiredDose) {
    fields.push({ label: "Назначена доза", value: input.requiredDose });
  }

  const errors = validatePositiveFields(fields);

  if (errors.length) {
    return { ok: false, errors };
  }

  const vialMg = toMg(input.vialAmount, input.vialAmountUnit);
  const diluentMl = toMl(input.diluentVolume, input.diluentVolumeUnit);
  const finalMl = toMl(input.finalVolume, input.finalVolumeUnit);
  const concentration = vialMg / finalMl;
  const instructions = [
    `Добавете ${formatVolumeMl(diluentMl)} от посочения разтворител към флакона.`,
    `Използвайте крайния разтворен обем от инструкцията: ${formatVolumeMl(finalMl)}.`,
    `Получена концентрация: ${formatConcentrationMgPerMl(concentration)}.`,
  ];
  const finalLines = [`Количество във флакона: ${formatMassMg(vialMg)}`, `Краен разтворен обем: ${formatVolumeMl(finalMl)}`, `Концентрация: ${formatConcentrationMgPerMl(concentration)}`];
  const traces = [`${formatMassMg(vialMg)} ÷ ${formatVolumeMl(finalMl)} = ${formatConcentrationMgPerMl(concentration)}`];
  const notices = [
    massConversionTrace(input.vialAmount, input.vialAmountUnit, "mg"),
    volumeConversionTrace(input.diluentVolume, input.diluentVolumeUnit, "mL"),
    volumeConversionTrace(input.finalVolume, input.finalVolumeUnit, "mL"),
  ].filter(Boolean);
  const warnings = highAlertWarning(input.highAlert);
  let primary = formatConcentrationMgPerMl(concentration);
  let recipe = `Добавете ${formatVolumeMl(diluentMl)} разтворител. Краен разтворен обем: ${formatVolumeMl(finalMl)}.`;

  if (input.requiredDose) {
    const requiredMg = toMg(input.requiredDose, input.requiredDoseUnit);
    const withdrawMl = requiredMg / concentration;
    primary = formatVolumeMl(withdrawMl);
    instructions.push(`За доза ${formatMassMg(requiredMg)} изтеглете ${formatVolumeMl(withdrawMl)}.`);
    finalLines.push(`Доза за изтегляне: ${formatMassMg(requiredMg)}`);
    traces.push(`${formatMassMg(requiredMg)} ÷ ${formatConcentrationMgPerMl(concentration)} = ${formatVolumeMl(withdrawMl)}`);
    notices.push(massConversionTrace(input.requiredDose, input.requiredDoseUnit, "mg"));
    warnings.push(...volumeWarnings(withdrawMl));
    recipe += ` За доза ${formatMassMg(requiredMg)} изтеглете ${formatVolumeMl(withdrawMl)}.`;
  }

  return {
    ok: true,
    primary,
    instructions,
    finalLines,
    notices: notices.filter(Boolean),
    traces,
    warnings,
    label: {
      totalAmount: formatMassMg(vialMg),
      finalVolume: formatVolumeMl(finalMl),
      concentration: `${formatNumber(concentration)} mg/mL`,
      recipe,
    },
  };
}
