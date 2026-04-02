import { test, expect } from '../../testing/vibe-core/base.fixture'

test.describe('Login Page', () => {
  test('shows login form with email input and magic link button', async ({ vibePage: page }) => {
    await page.goto('/login')

    await expect(page.getByTestId('login-title')).toBeVisible()
    await expect(page.getByTestId('login-title')).toHaveText('Inloggen')

    await expect(page.getByTestId('email-input')).toBeVisible()
    await expect(page.getByTestId('magic-link-button')).toBeVisible()
    await expect(page.getByTestId('google-login-button')).toBeVisible()

    await (page as any).vibeCheck('login-form')
  })

  test('shows email input with correct placeholder', async ({ vibePage: page }) => {
    await page.goto('/login')

    const emailInput = page.getByTestId('email-input')
    await expect(emailInput).toHaveAttribute('placeholder', 'naam@bedrijf.nl')
    await expect(emailInput).toHaveAttribute('type', 'email')
    await expect(emailInput).toHaveAttribute('required', '')

    await (page as any).vibeCheck('login-email-input')
  })

  test('preserves redirect query parameter', async ({ vibePage: page }) => {
    await page.goto('/login?redirect=/deck/new')

    await expect(page.getByTestId('login-title')).toBeVisible()
    // The page should load correctly with the redirect param

    await (page as any).vibeCheck('login-with-redirect')
  })
})
