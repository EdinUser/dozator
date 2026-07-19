import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("dozator-safety-acknowledged", "yes");
  });
});

test("home and calculator forms have no serious automated accessibility violations", async ({ page }) => {
  await page.goto("/");
  await expectNoSeriousViolations(page);

  for (const calculatorName of [
    /Доза от готов разтвор/,
    /Разреждане до концентрация/,
    /Разтваряне на флакон/,
    /Инфузионна скорост/,
  ]) {
    await page.getByRole("button", { name: calculatorName }).click();
    await expectNoSeriousViolations(page);
    await page.getByRole("button", { name: "Назад" }).click();
  }
});

test("result and field-error states have no serious automated accessibility violations", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Доза от готов разтвор/ }).click();

  await page.locator("#requiredDose").fill("0");
  await page.getByRole("button", { name: "Изчисли" }).click();
  await expect(page.locator("#requiredDose")).toHaveAttribute("aria-invalid", "true");
  await expectNoSeriousViolations(page);

  await page.locator("#requiredDose").fill("125");
  await page.locator("#availableAmount").fill("250");
  await page.locator("#availableVolume").fill("5");
  await page.getByRole("button", { name: "Изчисли" }).click();
  await expect(page.getByLabel("Резултат от изчислението")).toBeFocused();
  await expectNoSeriousViolations(page);
});

test("keyboard can reach skip link and open an infusion submode", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Към съдържанието" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#screen")).toBeFocused();

  await page.getByRole("button", { name: /Инфузионна скорост/ }).click();
  await page.locator("#mode-dose").focus();
  await expect(page.locator("#mode-dose")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#mode-time")).toBeChecked();
});

async function expectNoSeriousViolations(page) {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });
  await page.waitForTimeout(100);

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const seriousViolations = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));

  expect(seriousViolations).toEqual([]);
}
