import type { Page } from '@playwright/test';

/*
 * Waits until the page DOM stops mutating for a given period of time.
 *
 * Uses MutationObserver instead of polling to stabilize SPA rendering
 * (Angular/React/Vue) before taking visual screenshots.
 *
 * Prevents flaky visual regression tests caused by late UI updates.
 * If Angular/Nebular generates excessive attribute mutations,
 * set `attributes: false` in observer options.
 */

type WaitForStableDomOptions = {
  stableDelay?: number;
  timeout?: number;
};

export async function waitForStableDom(
  page: Page,
  { stableDelay = 1000, timeout = 15000 }: WaitForStableDomOptions = {}
): Promise<void> {
  await page.evaluate(
    ({ stableDelay, timeout }) =>
      new Promise<void>((resolve, reject) => {
        let observer: MutationObserver | null = null;
        let timeoutId = 0;
        let stableTimer = 0;

        const cleanup = () => {
          window.clearTimeout(timeoutId);
          window.clearTimeout(stableTimer);
          observer?.disconnect();
        };

        const finish = () => {
          cleanup();
          resolve();
        };

        const reset = () => {
          window.clearTimeout(stableTimer);
          stableTimer = window.setTimeout(finish, stableDelay);
        };

        timeoutId = window.setTimeout(() => {
          cleanup();
          reject(
            new Error(
              `waitForStableDom timed out after ${timeout}ms (stableDelay=${stableDelay}ms)`
            )
          );
        }, timeout);

        stableTimer = window.setTimeout(finish, stableDelay);

        observer = new MutationObserver(reset);
        const root = document.documentElement ?? document.body ?? document;
        observer.observe(root, {
          subtree: true,
          childList: true,
          attributes: true,
          characterData: true,
        });
      }),
    { stableDelay, timeout }
  );
}
