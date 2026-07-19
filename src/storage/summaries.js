import { bg } from "../i18n/bg.js";

export function calculationSummary(calculator, values) {
  return bg.summaries[calculator]?.(values) || "";
}
