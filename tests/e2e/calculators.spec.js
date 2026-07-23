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

test("calculator documentation round-trip keeps form values", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Доза от готов разтвор/ }).click();

  await page.locator("#requiredDose").fill("125");
  await page.locator("select[name='requiredDoseUnit']").selectOption("µg");
  await page.locator("#availableAmount").fill("250");
  await page.locator("#availableVolume").fill("5");
  await page.getByRole("link", { name: "Помощ" }).click();

  await expect(page).toHaveURL(/#\/documentation\/dose$/);

  await page.goBack();

  await expect(page).toHaveURL(/#dose$/);
  await expect(page.locator("#requiredDose")).toHaveValue("125");
  await expect(page.locator("select[name='requiredDoseUnit']")).toHaveValue("µg");
  await expect(page.locator("#availableAmount")).toHaveValue("250");
  await expect(page.locator("#availableVolume")).toHaveValue("5");
});

test("new calculation clears the current calculator without returning home", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Доза от готов разтвор/ }).click();

  await page.locator("#requiredDose").fill("125");
  await page.locator("#availableAmount").fill("250");
  await page.locator("#availableVolume").fill("5");
  await page.getByRole("button", { name: "Изчисли" }).click();
  await page.getByRole("button", { name: "Ново изчисление" }).click();

  await expect(page).toHaveURL(/#dose$/);
  await expect(page.getByRole("heading", { name: "Доза от готов разтвор" })).toBeVisible();
  await expect(page.locator("#requiredDose")).toHaveValue("");
  await expect(page.locator("#availableAmount")).toHaveValue("");
  await expect(page.locator("#availableVolume")).toHaveValue("");
  await expect(page.getByLabel("Резултат от изчислението")).toHaveCount(0);
});

test("dilution calculator rejects impossible concentration and focuses the target field", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Разреждане до желано количество в 1 мл/ }).click();

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
  await page.getByRole("button", { name: /Разреждане до желано количество в 1 мл/ }).click();

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

test("dilution calculator supports amount-only preparation without initial volume", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Разреждане до желано количество в 1 мл/ }).click();

  await page.locator("#availableAmount").fill("1");
  await page.locator("select[name='availableAmountUnit']").selectOption("g");
  await page.locator("#targetConcentration").fill("100");
  await page.getByRole("button", { name: "Изчисли" }).click();

  await expect(page.getByText("10 mL").first()).toBeVisible();
  await expect(page.getByText("Използвайте 1 g лекарство.")).toBeVisible();
  await expect(page.getByText("Пригответе до краен обем 10 mL с посочения разтворител.")).toBeVisible();
  await expect(page.getByText("1 g ÷ 100 mg/mL = 10 mL")).toBeVisible();
});

test("dilution calculator supports concentration-to-concentration dilution", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Разреждане до желано количество в 1 мл/ }).click();

  await page.locator("label[for='mode-dilution-concentration']").click();
  await page.locator("#sourceConcentration").fill("10");
  await page.locator("#sourceVolume").fill("5");
  await page.locator("#targetConcentration").fill("2");
  await page.locator("select[name='targetConcentrationUnit']").selectOption("%");
  await page.getByRole("button", { name: "Изчисли" }).click();

  await expect(page.getByText("25 mL").first()).toBeVisible();
  await expect(page.getByText("Добавете 20 mL от посочения разтворител.")).toBeVisible();
  await expect(page.getByText("100 mg/mL × 5 mL = 500 mg")).toBeVisible();
  await expect(page.getByText("25 mL - 5 mL = 20 mL")).toBeVisible();
});

test("dilution history restores the selected tab", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Разреждане до желано количество в 1 мл/ }).click();

  await page.locator("label[for='mode-dilution-concentration']").click();
  await page.locator("#sourceConcentration").fill("10");
  await page.locator("#sourceVolume").fill("5");
  await page.locator("#targetConcentration").fill("2");
  await page.locator("select[name='targetConcentrationUnit']").selectOption("%");
  await page.getByRole("button", { name: "Изчисли" }).click();

  await page.getByRole("button", { name: "История" }).click();
  await page.getByRole("button", { name: "Отвори" }).first().click();

  await expect(page.locator("#mode-dilution-concentration")).toBeChecked();
  await expect(page.locator("#sourceConcentration")).toHaveValue("10");
  await expect(page.locator("#sourceVolume")).toHaveValue("5");
  await expect(page.getByText("25 mL").first()).toBeVisible();
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
  await page.getByRole("button", { name: /Инфузионен калкулатор/ }).click();

  await expect(page.locator("#mode-amount")).toBeChecked();
  await page.locator("#amountPatientWeight").fill("1");
  await page.locator("#amountPrescribedRate").fill("5");
  await page.getByRole("button", { name: "Изчисли" }).click();

  await expect(page.getByText("7.2 mg").first()).toBeVisible();
  await expect(page.getByText("5 µg/min × 60 min/h × 24 h = 7200 µg = 7.2 mg")).toBeVisible();
  await expect(page.getByRole("button", { name: "Продължи в „Доза за час“" })).toBeVisible();

  await page.getByRole("button", { name: "Промени" }).click();
  await page.locator("label[for='mode-dose']").click();

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
  await expect(page.getByText("0.35 mg/h ÷ 2 mg/mL = 0.18 mL/h").first()).toBeVisible();

  await page.getByRole("button", { name: "Промени" }).click();
  await page.locator("label[for='mode-time']").click();
  await page.locator("#volume").fill("500");
  await page.locator("#time").fill("4");
  await page.getByRole("button", { name: "Изчисли" }).click();

  await expect(page.getByText("125 mL/h").first()).toBeVisible();
  await expect(page.getByText("500 mL ÷ 4 h = 125 mL/h")).toBeVisible();
});
