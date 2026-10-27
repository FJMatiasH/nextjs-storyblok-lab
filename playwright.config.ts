import { defineConfig, devices } from "@playwright/test";

const port = 3100;
const baseURL = `http://localhost:${port}`;

// E2E tests live in e2e/; Jest owns the *.test.ts(x) files under src/.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // Fail on CI if test.only was left in the source.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  // Chromium only, to keep the run fast; the flows are not engine-specific.
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Tests run against the production build, as users get it. Content comes
  // from Storyblok through the token in .env.local (server-side fetch).
  webServer: {
    command: `npm run build && npm run start -- --port ${port}`,
    url: `${baseURL}/en`,
    reuseExistingServer: !process.env.CI,
    // A cold production build can take a few minutes.
    timeout: 300_000,
    env: {
      // Empty wins over .env files, so the contact action uses its local
      // fallback (logs instead of sending) and nothing leaves the machine.
      CONTACT_API_URL: "",
    },
  },
});
