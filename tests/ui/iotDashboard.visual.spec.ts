import { test, expect } from '@playwright/test'
import { waitForStableDom } from '../../helpers/domStability'

//@refactor
test('IoT Dashboard - visual', async ({ page }) => {
  await page.goto('/pages/iot-dashboard');
  await waitForStableDom(page);
//   await expect(page).toHaveScreenshot();
  await expect(page).toHaveScreenshot({maxDiffPixelRatio: 0.02});
});