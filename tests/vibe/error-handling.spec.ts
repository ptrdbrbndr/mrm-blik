import { test, expect } from '../../testing/vibe-core/base.fixture'

test.describe('Error Handling & Loading States', () => {
  test('404 page renders correctly', async ({ vibePage: page }) => {
    await page.goto('/this-page-does-not-exist')

    // Next.js should render a 404 page
    const response = await page.goto('/this-page-does-not-exist')
    expect(response?.status()).toBe(404)

    await (page as any).vibeCheck('404-page')
  })

  test('protected routes redirect unauthenticated users', async ({ vibePage: page }) => {
    const protectedRoutes = ['/dashboard', '/deck/new']

    for (const route of protectedRoutes) {
      await page.goto(route)
      await expect(page).toHaveURL(/\/login/)
    }

    await (page as any).vibeCheck('protected-routes')
  })

  test('swipe routes are publicly accessible', async ({ vibePage: page }) => {
    await page.goto('/swipe/test-token')

    // Should NOT redirect to login — swipe routes are public
    const url = page.url()
    expect(url).not.toContain('/login')

    await (page as any).vibeCheck('public-swipe-route')
  })

  test('manifest.json is accessible', async ({ vibePage: page }) => {
    const response = await page.goto('/manifest.json')
    expect(response?.status()).toBe(200)

    const text = await response?.text()
    const manifest = JSON.parse(text || '{}')
    expect(manifest.name).toBe('MRM-Blik — Miracle Roadmap Tinder')
    expect(manifest.theme_color).toBe('#1B2A4A')

    await (page as any).vibeCheck('manifest-accessible')
  })

  test('favicon.svg is accessible', async ({ vibePage: page }) => {
    const response = await page.goto('/favicon.svg')
    expect(response?.status()).toBe(200)

    await (page as any).vibeCheck('favicon-accessible')
  })
})
