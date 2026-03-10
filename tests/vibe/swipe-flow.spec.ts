import { test, expect } from '../../testing/vibe-core/base.fixture'

test.describe('Swipe Flow', () => {
  test('shows not found for invalid token', async ({ vibePage: page }) => {
    await page.goto('/swipe/nonexistent-token')

    const notFound = page.getByTestId('deck-not-found')
    const empty = page.getByTestId('deck-empty')

    // Either not found or empty is acceptable
    const isNotFound = await notFound.isVisible().catch(() => false)
    const isEmpty = await empty.isVisible().catch(() => false)

    expect(isNotFound || isEmpty).toBeTruthy()

    await (page as any).vibeCheck('swipe-invalid-token')
  })
})
