import {test, expect} from '@playwright/test'
import {waitForStableDom} from '../../helpers/domStability'


test('E-commerce animation - visual', async ({page}) => {
    await page.goto('/pages/dashboard')
    await waitForStableDom(page) // helper dodatkowo wstrzykuje no-anim style
    await expect(page).toHaveScreenshot({
    mask: [
        page.locator('ngx-earning-card-front nb-card-body'),
        page.locator('ngx-traffic-front-card nb-list'),
        page.locator('ngx-user-activity nb-list'),
    ],
});
})
