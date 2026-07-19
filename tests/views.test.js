import { describe, expect, it } from "vitest";
import { bg } from "../src/i18n/bg.js";
import { renderCalculatorScreen, renderClinicalValidationScreen, renderResultPanel } from "../src/ui/views.js";

describe("calculator views", () => {
  it("renders infusion as two clear suboptions", () => {
    const html = renderCalculatorScreen({
      title: bg.calculators.infusion.title,
      subtitle: bg.calculators.infusion.subtitle,
      render: "infusion",
    });

    expect(html).toContain("Доза за час");
    expect(html).toContain("Обем и време");
    expect(html).toContain("data-mode-panel=\"doseRate\"");
    expect(html).toContain("data-mode-panel=\"volumeTime\"");
  });

  it("renders forms with custom validation targets", () => {
    const html = renderCalculatorScreen({
      title: bg.calculators.dose.title,
      subtitle: bg.calculators.dose.subtitle,
      render: "dose",
    });

    expect(html).toContain("novalidate");
    expect(html).toContain("id=\"requiredDoseError\"");
    expect(html).toContain("class=\"invalid-feedback field-error\"");
    expect(html).toContain("placeholder=\"125\"");
    expect(html).not.toContain("value=\"125\"");
  });

  it("renders validation summary for current calculator formulas", () => {
    const html = renderClinicalValidationScreen();

    expect(html).toContain("1% се приема като 10 mg/mL");
    expect(html).toContain("Разреждане към краен обем");
    expect(html).toContain("Разреждане на наличен обем");
    expect(html).toContain("/min се умножава по kg и по 60");
    expect(html).toContain("/h се умножава по kg без x60");
  });

  it("renders focusable live result and alert panels", () => {
    const success = renderResultPanel({
      ok: true,
      primary: "2.5 mL",
      warnings: [],
      notices: [],
      instructions: ["Изтеглете 2.5 mL."],
      traces: ["125 mg ÷ 50 mg/mL = 2.5 mL"],
    });
    const error = renderResultPanel({
      ok: false,
      errors: ["Доза трябва да бъде положително число."],
    });

    expect(success).toContain("aria-live=\"polite\"");
    expect(success).toContain("aria-label=\"Резултат от изчислението\"");
    expect(success).toContain("tabindex=\"-1\"");
    expect(success).toContain("data-result-panel");
    expect(error).toContain("role=\"alert\"");
    expect(error).toContain("aria-label=\"Грешки в изчислението\"");
    expect(error).toContain("data-result-panel");
  });
});
