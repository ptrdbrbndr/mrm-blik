import { test, expect } from '../../testing/vibe-core/base.fixture'

test.describe('Deck Builder', () => {
  test('shows new deck form or redirects to login', async ({ vibePage: page }) => {
    await page.goto('/deck/new')

    // May redirect to login if not authenticated, which is expected
    const url = page.url()
    if (url.includes('/login')) {
      await expect(page.getByTestId('login-title')).toBeVisible()
      await (page as any).vibeCheck('deck-new-redirects-to-login')
      return
    }

    await expect(page.getByTestId('new-deck-title')).toBeVisible()
    await expect(page.getByTestId('deck-title-input')).toBeVisible()
    await expect(page.getByTestId('deck-description-input')).toBeVisible()
    await expect(page.getByTestId('create-deck-button')).toBeVisible()

    await (page as any).vibeCheck('deck-new-form')
  })

  test('dashboard requires authentication', async ({ vibePage: page }) => {
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByTestId('login-title')).toBeVisible()

    await (page as any).vibeCheck('dashboard-requires-auth')
  })

  test('deck detail requires authentication', async ({ vibePage: page }) => {
    await page.goto('/deck/00000000-0000-0000-0000-000000000000')

    await expect(page).toHaveURL(/\/login/)

    await (page as any).vibeCheck('deck-detail-requires-auth')
  })
})
