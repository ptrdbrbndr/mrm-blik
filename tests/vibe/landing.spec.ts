import { test, expect } from '../../testing/vibe-core/base.fixture'

test.describe('Landing page', () => {
  test('shows hero and CTAs', async ({ vibePage: page }) => {
    await page.goto('/')

    await expect(page.getByTestId('hero-title')).toBeVisible()
    await expect(page.getByTestId('hero-title')).toHaveText('MRM-Blik')
    await expect(page.getByTestId('hero-subtitle')).toHaveText('Miracle Roadmap Tinder')

    await expect(page.getByTestId('cta-dashboard')).toBeVisible()
    await expect(page.getByTestId('cta-login')).toBeVisible()

    await expect(page.getByTestId('feature-create')).toBeVisible()
    await expect(page.getByTestId('feature-swipe')).toBeVisible()
    await expect(page.getByTestId('feature-results')).toBeVisible()

    await (page as any).vibeCheck('landing-hero')
  })

  test('navigates to login', async ({ vibePage: page }) => {
    await page.goto('/')
    await page.getByTestId('cta-login').click()
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByTestId('login-title')).toBeVisible()

    await (page as any).vibeCheck('login-page')
  })
})
