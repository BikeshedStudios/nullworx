import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

export default defineConfig({
  ...base,
  testMatch: "ascii-release.spec.ts",
  use: { ...base.use, headless: false, launchOptions: {
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--use-gl=angle", "--use-angle=gl", "--ignore-gpu-blocklist", "--disable-dev-shm-usage"],
  } },
});
