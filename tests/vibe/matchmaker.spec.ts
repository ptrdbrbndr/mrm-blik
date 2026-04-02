import { test, expect } from '../../testing/vibe-core/base.fixture'

test.describe('Login', () => {
  test('toont loginformulier met magic link en Google', async ({ vibePage: page }) => {
    await page.goto('/login')

    await expect(page.getByTestId('login-title')).toBeVisible()
    await expect(page.getByTestId('login-title')).toHaveText('Inloggen')
    await expect(page.getByTestId('email-input')).toBeVisible()
    await expect(page.getByTestId('magic-link-button')).toBeVisible()
    await expect(page.getByTestId('google-login-button')).toBeVisible()

    await (page as any).vibeCheck('login-form')
  })

  test('e-mailinput heeft juiste attributen', async ({ vibePage: page }) => {
    await page.goto('/login')

    const input = page.getByTestId('email-input')
    await expect(input).toHaveAttribute('type', 'email')
    await expect(input).toHaveAttribute('placeholder', 'naam@bedrijf.nl')
    await expect(input).toHaveAttribute('required', '')

    await (page as any).vibeCheck('login-email-attrs')
  })

  test('toont bevestiging na versturen magic link', async ({ vibePage: page }) => {
    await page.goto('/login')

    await page.getByTestId('email-input').fill('test@example.com')
    await page.getByTestId('magic-link-button').click()

    await expect(page.getByTestId('magic-link-sent')).toBeVisible({ timeout: 8000 })

    await (page as any).vibeCheck('login-magic-link-sent')
  })
})

test.describe('Beveiligde routes', () => {
  test('/discover stuurt door naar login', async ({ vibePage: page }) => {
    await page.goto('/discover')
    await expect(page).toHaveURL(/\/login/)
    await (page as any).vibeCheck('discover-redirect-login')
  })

  test('/matches stuurt door naar login', async ({ vibePage: page }) => {
    await page.goto('/matches')
    await expect(page).toHaveURL(/\/login/)
    await (page as any).vibeCheck('matches-redirect-login')
  })

  test('/chat stuurt door naar login', async ({ vibePage: page }) => {
    await page.goto('/chat')
    await expect(page).toHaveURL(/\/login/)
    await (page as any).vibeCheck('chat-redirect-login')
  })

  test('/profiel stuurt door naar login', async ({ vibePage: page }) => {
    await page.goto('/profiel')
    await expect(page).toHaveURL(/\/login/)
    await (page as any).vibeCheck('profiel-redirect-login')
  })
})
