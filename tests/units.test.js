import { describe, expect, it } from "vitest";
import {
  concentrationConversionTrace,
  concentrationToMgPerMl,
  directConcentrationConversionTrace,
  directConcentrationToMgPerMl,
  formatConcentrationMgPerMl,
  formatMassMg,
  formatNumber,
  formatVolumeMl,
  massConversionTrace,
  parseDecimal,
  toMg,
  toMl,
  volumeConversionTrace,
} from "../src/units/units.js";

describe("decimal parsing", () => {
  it.each([
    ["0.5", 0.5],
    ["0,5", 0.5],
    ["10", 10],
    [" 2,75 ", 2.75],
  ])("parses %s", (input, expected) => {
    expect(parseDecimal(input)).toBe(expected);
  });

  it.each(["", " ", ".5", "1..2", "1,2,3", "abc", "-1"])("rejects %s", (input) => {
    expect(Number.isNaN(parseDecimal(input))).toBe(true);
  });
});

describe("unit conversion", () => {
  it.each([
    ["g", "1", 1000],
    ["mg", "1", 1],
    ["µg", "1000", 1],
  ])("converts %s to mg", (unit, value, expected) => {
    expect(toMg(value, unit)).toBe(expected);
  });

  it.each([
    ["L", "1", 1000],
    ["mL", "1", 1],
    ["L", "0,25", 250],
  ])("converts %s to mL", (unit, value, expected) => {
    expect(toMl(value, unit)).toBe(expected);
  });

  it("converts concentration to mg/mL", () => {
    expect(concentrationToMgPerMl("1", "g", "0.5", "L")).toBe(2);
    expect(concentrationToMgPerMl("250", "µg", "5", "mL")).toBe(0.05);
    expect(directConcentrationToMgPerMl("500", "µg/mL")).toBe(0.5);
    expect(directConcentrationToMgPerMl("1", "%")).toBe(10);
  });

  it("creates explicit conversion traces", () => {
    expect(massConversionTrace("1", "g", "mg")).toBe("1 g = 1000 mg");
    expect(massConversionTrace("250", "µg", "mg")).toBe("250 µg = 0.25 mg");
    expect(volumeConversionTrace("0,25", "L", "mL")).toBe("0.25 L = 250 mL");
    expect(concentrationConversionTrace("1", "g", "0.5", "L")).toEqual(["1 g = 1000 mg", "0.5 L = 500 mL"]);
    expect(directConcentrationConversionTrace("500", "µg/mL")).toBe("500 µg/mL = 0.5 mg/mL");
    expect(directConcentrationConversionTrace("1", "%")).toBe("1 % = 10 mg/mL");
  });
});

describe("safety formatting", () => {
  it.each([
    [".5", ""],
    ["0.5", "0.5"],
    ["5.0", "5"],
    [2.5000001, "2.5"],
  ])("formats %s without unsafe zero style", (input, expected) => {
    expect(formatNumber(input)).toBe(expected);
  });

  it("formats mass and concentration in readable units", () => {
    expect(formatMassMg(0.25)).toBe("250 µg");
    expect(formatMassMg(1000)).toBe("1 g");
    expect(formatConcentrationMgPerMl(0.1)).toBe("100 µg/mL");
  });

  it("formats volumes with leading zeroes", () => {
    expect(formatVolumeMl(0.05)).toBe("0.05 mL");
  });
});
