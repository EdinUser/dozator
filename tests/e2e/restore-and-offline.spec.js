import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("dozator-safety-acknowledged", "yes");
  });
});

test("history restore recalculates and shows restore warning", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Доза от готов разтвор/ }).click();
  await page.locator("#requiredDose").fill("125");
  await page.locator("#availableAmount").fill("250");
  await page.locator("#availableVolume").fill("5");
  await page.getByRole("button", { name: "Изчисли" }).click();

  await page.getByRole("button", { name: "История" }).click();
  await page.getByRole("button", { name: "Отвори" }).first().click();

  await expect(page.getByRole("alert").filter({ hasText: "Заредено е предишно изчисление" })).toBeVisible();
  await expect(page.getByText("2.5 mL").first()).toBeVisible();
  await expect(page.getByText("Изтеглете 2.5 mL от наличния разтвор.")).toBeVisible();
});

test("template restore recalculates and keeps optional template name out of result", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Доза от готов разтвор/ }).click();
  await page.locator("#requiredDose").fill("125");
  await page.locator("#availableAmount").fill("250");
  await page.locator("#availableVolume").fill("5");
  await page.getByRole("button", { name: "Изчисли" }).click();

  await page.getByRole("button", { name: "Запази" }).click();
  await page.locator("#favoriteName").fill("Честа подготовка");
  await page.locator("[data-favorite-form]").getByRole("button", { name: "Запази" }).click();

  await page.getByRole("button", { name: "Шаблони" }).click();
  await expect(page.getByText("Честа подготовка")).toBeVisible();
  await page.getByRole("button", { name: "Отвори" }).first().click();

  await expect(page.getByRole("alert").filter({ hasText: "Заредено е предишно изчисление" })).toBeVisible();
  await expect(page.getByText("2.5 mL").first()).toBeVisible();
});

test("QR URL restore sanitizes free-text fields and recalculates locally", async ({ page }) => {
  const payload = {
    v: 1,
    calculator: "reconstitution",
    values: {
      vialAmount: "1",
      vialAmountUnit: "g",
      diluentVolume: "10",
      diluentVolumeUnit: "mL",
      finalVolume: "10",
      finalVolumeUnit: "mL",
      requiredDose: "350",
      requiredDoseUnit: "mg",
      highAlert: false,
      diluent: "patient name must not be restored",
      patientName: "not allowed",
    },
  };
  const encoded = Buffer.from(encodeURIComponent(JSON.stringify(payload))).toString("base64");

  await page.goto(`/#calc=${encoded}`);

  await expect(page.getByRole("alert").filter({ hasText: "Заредено е предишно изчисление" })).toBeVisible();
  await expect(page.getByText("3.5 mL").first()).toBeVisible();
  await expect(page.locator("#diluent")).toHaveValue("");
  await expect(page.locator("#requiredDose")).toHaveValue("350");
});

test("initial form examples are placeholders and focused values are selected", async ({ page }) => {
  await page.goto("/#dose");
  await expect(page.locator("#requiredDose")).toHaveValue("");
  await expect(page.locator("#requiredDose")).toHaveAttribute("placeholder", "въведете доза");

  await page.locator("#requiredDose").fill("125");
  await page.locator("#availableAmount").fill("250");
  await page.locator("#availableVolume").fill("5");
  await page.getByRole("button", { name: "Изчисли" }).click();
  await page.getByRole("button", { name: "История" }).click();
  await page.getByRole("button", { name: "Отвори" }).first().click();

  await expect(page.locator("#requiredDose")).toHaveValue("125");
  await page.getByRole("button", { name: "Промени" }).click();
  await page.locator("#requiredDose").focus();
  await page.keyboard.type("75");
  await expect(page.locator("#requiredDose")).toHaveValue("75");
});

test("screen hash URLs load and survive reload", async ({ page }) => {
  for (const route of [
    { hash: "dose", heading: "Доза от готов разтвор" },
    { hash: "dilution", heading: "Разреждане до количество в 1 mL" },
    { hash: "reconstitution", heading: "Разтваряне на флакон" },
    { hash: "infusion", heading: "Инфузионна скорост" },
    { hash: "validation", heading: "Как са проверени изчисленията" },
    { hash: "documentation", heading: "Документация" },
    { hash: "documentation/dose", heading: "Доза от готов разтвор" },
  ]) {
    await page.goto(`/#${route.hash}`);
    await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`#${route.hash}$`));
  }
});

test("calculator documentation links open the matching documentation section", async ({ page }) => {
  await page.goto("/#infusion");
  await page.getByRole("link", { name: "Помощ" }).click();

  await expect(page).toHaveURL(/#\/documentation\/infusion$/);
  await expect(page.locator("#documentation-infusion")).toBeFocused();
  await expect(page.locator("#documentation-infusion").getByRole("heading", { name: "Инфузионна скорост" })).toBeInViewport();
  await expect(page.getByText("Какво се изчислява").last()).toBeInViewport();
  await expect(page.locator("#documentation-infusion .documentation-figure")).not.toBeInViewport();
  await expect(page.getByRole("heading", { name: "Инфузионна скорост" })).toBeVisible();
  await expect(page.getByText("Изчислява скорост на помпа в mL/h")).toBeVisible();

  await page.locator("#documentation-infusion").getByRole("link", { name: "Към калкулатора" }).click();
  await expect(page).toHaveURL(/#infusion$/);
  await expect(page.getByRole("heading", { name: "Инфузионна скорост" })).toBeVisible();
});

test("scroll-to-top button returns long documentation pages to the top", async ({ page }) => {
  await page.goto("/#/documentation");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  const scrollTop = page.getByRole("button", { name: "Към началото" });
  await expect(scrollTop).toBeVisible();
  await scrollTop.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(20);
});

test("scroll-to-top button is reachable on mobile documentation sections", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/documentation/reconstitution");
  await page.getByRole("heading", { name: "Разтваряне на флакон" }).scrollIntoViewIfNeeded();

  await expect(page.getByRole("button", { name: "Към началото" })).toBeVisible();
});

test("installed app shell reloads while offline after first load", async ({ page, context }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();

  await expect(page.getByRole("heading", { name: "Какво подготвяте?" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Доза от готов разтвор/ })).toBeVisible();
});
