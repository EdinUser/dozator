import { describe, expect, it } from "vitest";
import { bg } from "../src/i18n/bg.js";
import { renderCalculatorScreen } from "../src/ui/views.js";

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
});
