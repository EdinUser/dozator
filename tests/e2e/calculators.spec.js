import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("dozator-safety-acknowledged", "yes");
  });
});

test("dose calculator shows result, instructions, and verification", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Доза от готов разтвор/ }).click();

  await page.locator("#requiredDose").fill("125");
  await page.locator("#availableAmount").fill("250");
  await page.locator("#availableVolume").fill("5");
  await page.getByRole("button", { name: "Изчисли" }).click();

  await expect(page.getByLabel("Резултат от изчислението")).toBeFocused();
  await expect(page.getByText("2.5 mL").first()).toBeVisible();
  await expect(page.getByText("Изтеглете 2.5 mL от наличния разтвор.")).toBeVisible();
  await expect(page.getByText("125 mg ÷ 50 mg/mL = 2.5 mL")).toBeVisible();
  await expect(page.getByText("Въведени данни")).toBeVisible();
});

test("dilution calculator rejects impossible concentration and focuses the target field", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Разреждане до концентрация/ }).click();

  await page.locator("#availableConcentration").fill("2");
  await page.locator("#targetConcentration").fill("10");
  await page.locator("#finalVolume").fill("20");
  await page.getByRole("button", { name: "Изчисли" }).click();

  await expect(page.locator("#targetConcentration")).toBeFocused();
  await expect(page.locator("#targetConcentration")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#targetConcentration")).toHaveAttribute("aria-describedby", /targetConcentrationError/);
  await expect(page.getByRole("alert", { name: "Грешки в изчислението" })).toContainText("Желаната концентрация е по-висока");
  await expect(page.locator("#targetConcentrationError")).toContainText("Желаната концентрация е по-висока");
});

test("dilution calculator shows unit conversions, instructions, and trace", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Разреждане до концентрация/ }).click();

  await page.locator("#availableConcentration").fill("1");
  await page.locator("select[name='availableConcentrationUnit']").selectOption("%");
  await page.locator("#targetConcentration").fill("500");
  await page.locator("select[name='targetConcentrationUnit']").selectOption("µg/mL");
  await page.locator("#finalVolume").fill("0.02");
  await page.locator("select[name='finalVolumeUnit']").selectOption("L");
  await page.getByRole("button", { name: "Изчисли" }).click();

  await expect(page.getByText("1 mL").first()).toBeVisible();
  await expect(page.getByText("Добавете 19 mL от посочения разтворител.")).toBeVisible();
  await expect(page.getByText("1 % = 10 mg/mL")).toBeVisible();
  await expect(page.getByText("500 µg/mL = 0.5 mg/mL")).toBeVisible();
  await expect(page.getByText("500 µg/mL × 20 mL = 10 mg")).toBeVisible();

  await page.getByRole("button", { name: "Промени" }).click();
  await page.locator("label[for='mode-stock-volume']").click();
  await page.locator("#availableConcentration").fill("10");
  await page.locator("select[name='availableConcentrationUnit']").selectOption("mg/mL");
  await page.locator("#targetConcentration").fill("2");
  await page.locator("select[name='targetConcentrationUnit']").selectOption("mg/mL");
  await page.locator("#stockVolume").fill("4");
  await page.getByRole("button", { name: "Изчисли" }).click();

  await expect(page.getByText("20 mL").first()).toBeVisible();
  await expect(page.getByText("40 mg ÷ 2 mg/mL = 20 mL")).toBeVisible();
});

test("reconstitution calculator supports manufacturer final volume and optional dose", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Разтваряне на флакон/ }).click();

  await page.locator("#vialAmount").fill("1");
  await page.locator("#diluentVolume").fill("9.6");
  await page.locator("#finalVolume").fill("10");
  await page.locator("#requiredDose").fill("250");
  await page.getByRole("button", { name: "Изчисли" }).click();

  await expect(page.getByText("2.5 mL").first()).toBeVisible();
  await expect(page.getByText("Добавете 9.6 mL от посочения разтворител към флакона.")).toBeVisible();
  await expect(page.getByText("Използвайте крайния разтворен обем от инструкцията: 10 mL.")).toBeVisible();
  await expect(page.getByText("250 mg ÷ 100 mg/mL = 2.5 mL")).toBeVisible();
});

test("infusion calculator handles dose-rate and volume-time modes separately", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Инфузионна скорост/ }).click();

  await page.locator("#medicationAmount").fill("500");
  await page.locator("#finalVolume").fill("250");
  await page.locator("#prescribedRate").fill("25");
  await page.locator("#hoursToRun").fill("5");
  await page.getByRole("button", { name: "Изчисли" }).click();

  await expect(page.getByText("12.5 mL/h").first()).toBeVisible();
  await expect(page.getByText("25 mg/h ÷ 2 mg/mL = 12.5 mL/h")).toBeVisible();
  await expect(page.getByText("250 mL ÷ 5 h = 50 mL/h")).toBeVisible();

  await page.getByRole("button", { name: "Промени" }).click();
  await page.locator("#patientWeight").fill("70");
  await page.locator("select[name='prescribedRateUnit']").selectOption("µg/kg/min");
  await page.locator("#prescribedRate").fill("5");
  await page.getByRole("button", { name: "Изчисли" }).click();

  await expect(page.getByText("21 mg/h ÷ 2 mg/mL = 10.5 mL/h")).toBeVisible();

  await page.getByRole("button", { name: "Промени" }).click();
  await page.locator("label[for='mode-time']").click();
  await page.locator("#volume").fill("500");
  await page.locator("#time").fill("4");
  await page.getByRole("button", { name: "Изчисли" }).click();

  await expect(page.getByText("125 mL/h").first()).toBeVisible();
  await expect(page.getByText("500 mL ÷ 4 h = 125 mL/h")).toBeVisible();
});
