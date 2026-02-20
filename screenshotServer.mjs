// Starts a shared Chromium instance as a WebSocket server.
// Playwright tests (e2e/visual) connect to this browser instead of launching their own.
// Used for deterministic screenshots and containerized test execution (Docker).

import { chromium } from "@playwright/test"

const server = await chromium.launchServer({
  headless: true,
  ignoreDefaultArgs: false,
  devtools: false,
  port: 9292,
  wsPath: "/pw",
  args: [],
  logger: {
    isEnabled: (name, severity) => severity === "error" || severity === "warning",
    log: (name, severity, message, args, metadata) => console.log({ name, severity, message, args, metadata })
  }
})

