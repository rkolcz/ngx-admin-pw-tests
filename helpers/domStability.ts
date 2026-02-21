import type { Page } from '@playwright/test';

type WaitForStableDomOptions = {
  /**
   * Jak długo (ms) DOM musi pozostać bez mutacji, by uznać go za stabilny.
   */
  stableDelay?: number;
  /**
   * Twardy limit czasu (ms) – po przekroczeniu rzuca wyjątek.
   */
  timeout?: number;
  /**
   * Automatyczne wyłączenie animacji / transition w testowanej stronie.
   * Dzięki temu nie trzeba przekazywać masek/ignorowanych selektorów.
   */
  disableAnimations?: boolean;
  /**
   * Czy resetować licznik także przy zmianach atrybutów.
   * Na stronach typu eCommerce Nebular mocno toggluje klasy/aria,
   * co potrafi nieskończenie resetować zegar – dlatego domyślnie false.
   */
  observeAttributes?: boolean;
};

/**
 * Czeka, aż DOM przestanie się zmieniać przez `stableDelay` ms.
 * - używa MutationObserver (brak kosztu serializacji DOM co pętlę),
 * - domyślnie wyłącza animacje/transition, by ustabilizować wizualki,
 * - ma twardy timeout.
 *
 * Wywołanie: `await waitForStableDom(page);`
 * Opcje są opcjonalne i mają sensowne defaulty.
 */
export async function waitForStableDom(
  page: Page,
  {
    stableDelay = 800,
    timeout = 15_000,
    disableAnimations = true,
    observeAttributes = false,
  }: WaitForStableDomOptions = {}
): Promise<void> {
  await page.evaluate(
    ({ stableDelay, timeout, disableAnimations, observeAttributes }) =>
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

        // Opcjonalnie wyłącz animacje/transition globalnie (raz na stronę).
        if (disableAnimations && !document.getElementById('__waitForStableDom__noanim')) {
          const style = document.createElement('style');
          style.id = '__waitForStableDom__noanim';
          style.textContent = `
            *, *::before, *::after {
              animation-duration: 0s !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0s !important;
              transition-delay: 0s !important;
              caret-color: transparent !important;
            }
          `;
          document.head.appendChild(style);
        }

        timeoutId = window.setTimeout(() => {
          cleanup();
          reject(
            new Error(
              `waitForStableDom timed out after ${timeout}ms (stableDelay=${stableDelay}ms)`
            )
          );
        }, timeout);

        stableTimer = window.setTimeout(finish, stableDelay);

        observer = new MutationObserver(() => reset());
        const root = document.documentElement ?? document.body ?? document;
        observer.observe(root, {
          subtree: true,
          childList: true,
          attributes: observeAttributes,
          characterData: true,
        });
      }),
    { stableDelay, timeout, disableAnimations, observeAttributes }
  );
}
