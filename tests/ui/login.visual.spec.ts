import { test, expect } from '@playwright/test'
import { waitForStableDom } from '../../helpers/domStability'



// test('Signal Platform – Login Page', async ({ page }) => {
//   await page.goto('/');
//   await page.waitForLoadState('networkidle') 
//   await page.waitForLoadState('domcontentloaded')
//   await waitForStableDom(page)
//   await expect(page).toHaveScreenshot(); 
// });


//@refactor
test('Login page visual', async ({ page }) => {
  await page.goto('/pages/iot-dashboard');
  await waitForStableDom(page);
  await expect(page).toHaveScreenshot();
});