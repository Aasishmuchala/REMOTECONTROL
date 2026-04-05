import { acquireContext, releaseContext } from '../lib/playwright';

export interface CaptureResult {
  screenshot: Buffer;
  dom: string;
  viewport: string;
  url: string;
  capturedAt: Date;
}

/**
 * Capture a full-page screenshot and DOM from a URL using Playwright.
 * Blocks non-essential resources for speed, handles SPA hydration.
 */
export async function capturePage(
  url: string,
  viewport = { width: 1920, height: 1080 }
): Promise<CaptureResult> {
  // SSRF mitigation: only allow https URLs
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      throw new Error('Only HTTPS URLs are allowed');
    }
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }

  const ctx = await acquireContext();
  try {
    const page = await ctx.newPage();

    // Block non-essential resource types for speed
    await page.route('**/*.{png,jpg,jpeg,gif,svg,webp,ico,woff,woff2,ttf,otf}', (route) => {
      route.abort();
    });

    let navigated = false;
    // Navigate with retry
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 30_000,
        });
        navigated = true;
        break;
      } catch {
        if (attempt === 0) continue;
        throw new Error(`Failed to navigate to ${url} after 2 attempts`);
      }
    }

    // SPA hydration wait strategy
    try {
      await page.waitForFunction(
        () => document.readyState === 'complete',
        { timeout: 10_000 }
      );
    } catch {
      // Fallback: fixed wait
      await page.waitForTimeout(3_000);
    }

    // Additional hydration buffer for React/Vue/Next.js
    await page.waitForTimeout(2_000);

    // Verify Next.js hydration if applicable
    const isNext = await page.evaluate(() => typeof window.__NEXT_DATA__ !== 'undefined');
    if (isNext) {
      await page.waitForFunction(
        () => !document.querySelector('[data-nextjs-root] [data-loading]'),
        { timeout: 5_000 }
      ).catch(() => {});
    }

    // Capture full-page PNG screenshot
    const screenshot = (await page.screenshot({
      fullPage: true,
      type: 'png',
    })) as Buffer;

    // Extract serialized DOM
    const dom = await page.content();

    await page.close();

    return {
      screenshot,
      dom,
      viewport: `${viewport.width}x${viewport.height}`,
      url,
      capturedAt: new Date(),
    };
  } finally {
    await releaseContext(ctx);
  }
}
