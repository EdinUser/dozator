import { readFile, writeFile } from "node:fs/promises";

const indexUrl = new URL("../dist/index.html", import.meta.url);
const html = await readFile(indexUrl, "utf8");
const widgetPattern = /    <!-- pinger-widget:start -->\n    <script\n      defer\n      src="https:\/\/ping\.kirilov\.dev\/widget\/v1\.js"\n      data-pinger-project-key="pk_Fp7ckXCu2kgmHN5KfqTWkZMTprrP6Rch1F_4NrxySgM"\n    ><\/script>\n    <!-- pinger-widget:end -->\n/;

if (!widgetPattern.test(html)) {
  throw new Error("The Pinger widget markup was not found in the E2E build.");
}

await writeFile(indexUrl, html.replace(widgetPattern, ""));
