import { defineConfig, devices } from "@playwright/test";

/**
 * The suite runs against a dev server on port 3000. If one is already running
 * it is reused; otherwise Playwright starts it and shuts it down afterwards.
 *
 * The backend must be running separately on port 8000 — the pages render real
 * project data, and an empty API would make the layout assertions meaningless.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
