import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    testTimeout: 20000,
    hookTimeout: 20000,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts", "public/domain.js"],
      // Configuração e ponto de entrada são verificados também pelos testes do servidor.
      exclude: ["src/config/**"],
      reporter: ["text", "html", "json-summary", "lcov"],
      thresholds: { lines: 60, statements: 60, functions: 60, branches: 60 },
    },
  },
});
