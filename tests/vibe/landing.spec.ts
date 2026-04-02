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

  test('navigates to dashboard (redirects to login when not auth)', async ({ vibePage: page }) => {
    await page.goto('/')
    await page.getByTestId('cta-dashboard').click()

    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/\/login/)

    await (page as any).vibeCheck('dashboard-redirect')
  })

  test('has correct meta tags', async ({ vibePage: page }) => {
    await page.goto('/')

    const title = await page.title()
    expect(title).toContain('MRM-Blik')

    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute('content', /productroadmap/)

    const themeColor = page.locator('meta[name="theme-color"]')
    await expect(themeColor).toHaveAttribute('content', '#1B2A4A')

    await (page as any).vibeCheck('landing-meta')
  })

  test('has favicon and manifest', async ({ vibePage: page }) => {
    await page.goto('/')

    const manifest = page.locator('link[rel="manifest"]')
    await expect(manifest).toHaveAttribute('href', '/manifest.json')

    await (page as any).vibeCheck('landing-pwa')
  })
})
