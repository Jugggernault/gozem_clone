import { defineConfig, devices } from "@playwright/test";

// ponytail: PORT lets parallel worktrees each run their own dev server.
const port = Number(process.env.PORT ?? 3000);
const url = `http://localhost:${port}`;

export default defineConfig({
  testDir: "e2e",
  use: { baseURL: url },
  projects: [
    {
      name: "mobile",
      use: {
        ...devices["Pixel 7"],
        // System Chromium: skips the (very slow) Playwright browser download.
        launchOptions: { executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium" },
      },
    },
  ],
  webServer: {
    command: process.env.CI ? `npm run build && npx next start -p ${port}` : `npx next dev -p ${port}`,
    url,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
