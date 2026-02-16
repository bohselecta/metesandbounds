import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node"
  },
  resolve: {
    alias: {
      "@parcel-link/data": resolve(__dirname, "src/index.ts")
    }
  }
});
