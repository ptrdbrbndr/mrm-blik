import { test, expect } from '../../testing/vibe-core/base.fixture'

test.describe('Deck Builder', () => {
  test('shows new deck form', async ({ vibePage: page }) => {
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
})
