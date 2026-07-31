import { formatMassMg, formatNumber, fromMg, parseDecimal, toMg } from "../units/units.js";
import { validatePositiveFieldEntries } from "../safety/warnings.js";
import { bg } from "../i18n/bg.js";

export function calculateIuConverter(input) {
  const fieldErrors = validatePositiveFieldEntries([
    { name: "relationshipIu", label: bg.fields.relationshipIu, value: input.relationshipIu },
    { name: "relationshipMass", label: bg.fields.relationshipMass, value: input.relationshipMass },
    { name: "amountToConvert", label: bg.fields.amountToConvert, value: input.amountToConvert },
  ]);

  if (fieldErrors.length) {
    return { ok: false, errors: fieldErrors.map((field) => field.message), fieldErrors };
  }

  const iu = parseDecimal(input.relationshipIu);
  const relationshipMassMg = toMg(input.relationshipMass, input.relationshipMassUnit);
  const mgPerIu = relationshipMassMg / iu;

  if (input.mode === "massToIu") {
    return calculateMassToIu(input, mgPerIu);
  }

  return calculateIuToMass(input, mgPerIu);
}

function calculateIuToMass(input, mgPerIu) {
  const amountIu = parseDecimal(input.amountToConvert);
  const resultMg = amountIu * mgPerIu;
  const resultValue = fromMg(resultMg, input.resultMassUnit);
  const result = `${formatNumber(resultValue)} ${input.resultMassUnit}`;
  const formattedMg = formatMassMg(resultMg);

  return {
    ok: true,
    primary: result,
    instructions: [bg.calculations.iuConverter.converted(result), bg.calculations.iuConverter.verifyRelationship],
    finalLines: [bg.calculations.iuConverter.relationship(relationshipLine(input)), bg.calculations.iuConverter.amount(`${formatNumber(amountIu)} IU`)],
    notices: equivalentMassNotices(resultMg, input.resultMassUnit),
    traces: [
      `${relationshipLine(input)} = ${formatNumber(mgPerIu)} mg/IU`,
      `${formatNumber(amountIu)} IU × ${formatNumber(mgPerIu)} mg/IU = ${formattedMg}`,
      ...(formattedMg === result ? [] : [`${formattedMg} = ${result}`]),
    ],
    warnings: [bg.calculations.iuConverter.noDatabase],
    label: {
      totalAmount: result,
      finalVolume: "",
      concentration: "",
      recipe: bg.calculations.iuConverter.converted(result),
    },
    carryForward: {
      targetCalculator: "dose",
      values: {
        requiredDose: formatNumber(resultValue),
        requiredDoseUnit: input.resultMassUnit,
      },
    },
  };
}

function calculateMassToIu(input, mgPerIu) {
  const amountMg = toMg(input.amountToConvert, input.amountToConvertUnit);
  const resultIu = amountMg / mgPerIu;
  const result = `${formatNumber(resultIu)} IU`;

  return {
    ok: true,
    primary: result,
    instructions: [bg.calculations.iuConverter.converted(result), bg.calculations.iuConverter.verifyRelationship],
    finalLines: [bg.calculations.iuConverter.relationship(relationshipLine(input)), bg.calculations.iuConverter.amount(`${formatNumber(input.amountToConvert)} ${input.amountToConvertUnit}`)],
    notices: equivalentMassNotices(amountMg, input.amountToConvertUnit),
    traces: [
      `${relationshipLine(input)} = ${formatNumber(mgPerIu)} mg/IU`,
      `${formatNumber(input.amountToConvert)} ${input.amountToConvertUnit} = ${formatNumber(amountMg)} mg`,
      `${formatNumber(amountMg)} mg ÷ ${formatNumber(mgPerIu)} mg/IU = ${formatNumber(resultIu)} IU`,
    ],
    warnings: [bg.calculations.iuConverter.noDatabase],
    label: {
      totalAmount: result,
      finalVolume: "",
      concentration: "",
      recipe: bg.calculations.iuConverter.converted(result),
    },
    carryForward: {
      targetCalculator: "dose",
      values: {
        requiredDose: formatNumber(resultIu),
        requiredDoseUnit: "IU",
      },
    },
  };
}

function relationshipLine(input) {
  return `${formatNumber(input.relationshipIu)} IU = ${formatNumber(input.relationshipMass)} ${input.relationshipMassUnit}`;
}

function equivalentMassNotices(valueMg, selectedUnit) {
  return ["µg", "mg", "g"]
    .filter((unit) => unit !== selectedUnit)
    .map((unit) => `${formatMassMg(valueMg)} = ${formatNumber(fromMg(valueMg, unit))} ${unit}`);
}
