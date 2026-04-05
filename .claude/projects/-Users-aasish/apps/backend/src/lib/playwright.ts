import { chromium, ChromiumBrowser, BrowserContext } from 'playwright';

const MAX_CONTEXTS = 5;
let browserInstance: ChromiumBrowser | null = null;
let activeContexts: BrowserContext[] = [];

/**
 * Get or create a reusable browser instance.
 * Thread-safe singleton for the browser lifecycle.
 */
export async function getBrowser(): Promise<ChromiumBrowser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await chromium.launch({ headless: true });
  }
  return browserInstance;
}

/**
 * Acquire a new browser context, evicting oldest if at limit.
 */
export async function acquireContext(): Promise<BrowserContext> {
  const browser = await getBrowser();
  if (activeContexts.length >= MAX_CONTEXTS) {
    const oldest = activeContexts.shift();
    if (oldest) await oldest.close().catch(() => {});
  }
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'NeuroScan/1.0 (+https://neuroscan.ai)',
  });
  activeContexts.push(ctx);
  return ctx;
}

/**
 * Release a context back to the pool.
 */
export async function releaseContext(ctx: BrowserContext): Promise<void> {
  await ctx.close().catch(() => {});
  activeContexts = activeContexts.filter((c) => c !== ctx);
}

/**
 * Graceful shutdown of browser.
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close().catch(() => {});
    browserInstance = null;
    activeContexts = [];
  }
}
