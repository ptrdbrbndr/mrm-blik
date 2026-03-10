import { test, expect } from '../../testing/vibe-core/base.fixture'

test.describe('Results Dashboard', () => {
  test('redirects to login when not authenticated', async ({ vibePage: page }) => {
    await page.goto('/deck/some-id/results')

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByTestId('login-title')).toBeVisible()

    await (page as any).vibeCheck('results-requires-auth')
  })
})
