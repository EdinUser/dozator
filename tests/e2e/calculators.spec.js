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
  await page.getByRole("button", { name: /Разреждане до количество в 1 mL/ }).click();

  await page.locator("#availableAmount").fill("4");
  await page.locator("#availableVolume").fill("2");
  await page.locator("#targetConcentration").fill("10");
  await page.getByRole("button", { name: "Изчисли" }).click();

  await expect(page.locator("#targetConcentration")).toBeFocused();
  await expect(page.locator("#targetConcentration")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#targetConcentration")).toHaveAttribute("aria-describedby", /targetConcentrationError/);
  await expect(page.getByRole("alert", { name: "Грешки в изчислението" })).toContainText("Желаното количество в 1 mL е по-високо");
  await expect(page.locator("#targetConcentrationError")).toContainText("Желаното количество в 1 mL е по-високо");
});

test("dilution calculator shows unit conversions, instructions, and trace", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Разреждане до количество в 1 mL/ }).click();

  await page.locator("#availableAmount").fill("10");
  await page.locator("#availableVolume").fill("0.001");
  await page.locator("select[name='availableVolumeUnit']").selectOption("L");
  await page.locator("#targetConcentration").fill("500");
  await page.locator("select[name='targetConcentrationUnit']").selectOption("µg/mL");
  await page.getByRole("button", { name: "Изчисли" }).click();

  await expect(page.getByText("20 mL").first()).toBeVisible();
  await expect(page.getByText("Добавете 19 mL от посочения разтворител.")).toBeVisible();
  await expect(page.getByText("0.001 L = 1 mL")).toBeVisible();
  await expect(page.getByText("500 µg/mL = 0.5 mg/mL")).toBeVisible();
  await expect(page.getByText("10 mg ÷ 500 µg/mL = 20 mL")).toBeVisible();
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

test("reconstitution calculator calculates final volume from desired amount in 1 mL", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Разтваряне на флакон/ }).click();

  await page.locator("#vialAmount").fill("1");
  await page.locator("#targetConcentration").fill("100");
  await page.getByRole("button", { name: "Изчисли" }).click();

  await expect(page.getByText("10 mL").first()).toBeVisible();
  await expect(page.getByText("Необходим краен обем след разтваряне: 10 mL.")).toBeVisible();
  await expect(page.getByText("Проверете в инструкцията дали добавеният разтворител е равен на крайния обем.")).toBeVisible();
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
  await page.locator("select[name='prescribedRateUnit']").selectOption("µg/kg/h");
  await page.locator("#prescribedRate").fill("5");
  await page.getByRole("button", { name: "Изчисли" }).click();

  await expect(page.getByText("5 µg/kg/h × 70 kg = 0.35 mg/h")).toHaveCount(2);
  await expect(page.getByText("0.35 mg/h ÷ 2 mg/mL = 0.175 mL/h").first()).toBeVisible();

  await page.getByRole("button", { name: "Промени" }).click();
  await page.locator("label[for='mode-time']").click();
  await page.locator("#volume").fill("500");
  await page.locator("#time").fill("4");
  await page.getByRole("button", { name: "Изчисли" }).click();

  await expect(page.getByText("125 mL/h").first()).toBeVisible();
  await expect(page.getByText("500 mL ÷ 4 h = 125 mL/h")).toBeVisible();
});
