import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://127.0.0.1:5173",
    defaultCommandTimeout: 8000,
    screenshotOnRunFailure: true,
    specPattern: "cypress/e2e/**/*.cy.{js,jsx}",
    supportFile: "cypress/support/e2e.js",
    video: false,
  },
});
