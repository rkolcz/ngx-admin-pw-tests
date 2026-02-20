import { test, expect } from '@playwright/test'
import { waitForStableDom } from '../../helpers/domStability'

//@refactor
test('Login page visual', async ({ page }) => {
  await page.goto('/pages/iot-dashboard');
  await waitForStableDom(page);
  await expect(page).toHaveScreenshot();
});