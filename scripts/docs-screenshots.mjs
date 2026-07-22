import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const host = "127.0.0.1";
const port = 5174;
const baseUrl = `http://${host}:${port}`;
const outputDir = "public/docs/screenshots";

const examples = [
  {
    name: "dose-result",
    route: "dose",
    run: async (page) => {
      await page.locator("#requiredDose").fill("125");
      await page.locator("#availableAmount").fill("250");
      await page.locator("#availableVolume").fill("5");
    },
  },
  {
    name: "dilution-result",
    route: "dilution",
    run: async (page) => {
      await page.locator("#availableAmount").fill("2");
      await page.locator("select[name='availableAmountUnit']").selectOption("g");
      await page.locator("#availableVolume").fill("1");
      await page.locator("#targetConcentration").fill("3");
      await page.locator("select[name='targetConcentrationUnit']").selectOption("%");
    },
  },
  {
    name: "reconstitution-result",
    route: "reconstitution",
    run: async (page) => {
      await page.locator("#vialAmount").fill("1");
      await page.locator("select[name='vialAmountUnit']").selectOption("g");
      await page.locator("#targetConcentration").fill("100");
    },
  },
  {
    name: "infusion-result",
    route: "infusion",
    run: async (page) => {
      await page.locator("#medicationAmount").fill("500");
      await page.locator("#finalVolume").fill("250");
      await page.locator("#prescribedRate").fill("25");
      await page.locator("#hoursToRun").fill("5");
    },
  },
];

await mkdir(outputDir, { recursive: true });

const server = spawn("npm", ["run", "dev", "--", "--host", host, "--port", String(port)], {
  stdio: "inherit",
});

try {
  await waitForServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 770, height: 868 } });

  for (const example of examples) {
    await page.addInitScript(() => {
      localStorage.setItem("dozator-safety-acknowledged", "yes");
    });
    await page.goto(`${baseUrl}/#${example.route}`);
    await page.addStyleTag({ content: ".skip-link, .scroll-top-button { display: none !important; }" });
    await example.run(page);
    await page.getByRole("button", { name: "Изчисли" }).click();
    await page.getByLabel("Резултат от изчислението").waitFor();
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
    await page.locator(".calculator-screen").screenshot({
      path: join(outputDir, `${example.name}.png`),
    });
  }

  await browser.close();
} finally {
  server.kill("SIGTERM");
}

async function waitForServer() {
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) {
        return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  throw new Error(`Timed out waiting for ${baseUrl}`);
}
