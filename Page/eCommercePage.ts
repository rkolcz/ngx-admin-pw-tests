import {Locator, Page} from '@playwright/test'

export class ECommercePage {
    readonly page: Page
    readonly animateEarningCard: Locator
    readonly animateTrafficFrontCard: Locator
    readonly animateUserActivity: Locator

    constructor(page: Page) {
        this.page = page
        this.animateEarningCard = page.locator('ngx-earning-card-front').locator('nb-card-body')
        this.animateTrafficFrontCard = page.locator('ngx-traffic-front-card').locator('nb-list')
        this.animateUserActivity = page.locator('ngx-user-activity').locator('nb-list')
    }
}