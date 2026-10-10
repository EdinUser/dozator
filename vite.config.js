import { defineConfig } from "vite";

const pingerWidgetPattern = /    <!-- pinger-widget:start -->\n    <script\n      defer\n      src="https:\/\/ping\.kirilov\.dev\/widget\/v1\.js"\n      data-pinger-project-key="pk_Fp7ckXCu2kgmHN5KfqTWkZMTprrP6Rch1F_4NrxySgM"\n    ><\/script>\n    <!-- pinger-widget:end -->\n/;

export default defineConfig(({ mode }) => ({
  plugins: mode === "e2e"
    ? [{
      name: "remove-pinger-widget-from-e2e-build",
      transformIndexHtml(html) {
        const transformedHtml = html.replace(pingerWidgetPattern, "");

        if (transformedHtml === html) {
          throw new Error("The Pinger widget markup was not found in the E2E build.");
        }

        return transformedHtml;
      },
    }]
    : [],
}));
