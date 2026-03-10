import { test as base, expect, type Page } from '@playwright/test'

type VibeFixtures = {
  vibePage: Page
}

export const test = base.extend<VibeFixtures>({
  vibePage: async ({ page }, use) => {
    // Capture console errors
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Add vibeCheck helper
    ;(page as any).vibeCheck = async (checkpoint: string) => {
      // Screenshot at checkpoint
      await page.screenshot({
        path: `test-results/vibe-${checkpoint}.png`,
        fullPage: true,
      })

      // Assert no console errors
      if (consoleErrors.length > 0) {
        throw new Error(
          `Console errors at checkpoint "${checkpoint}":\n${consoleErrors.join('\n')}`
        )
      }
    }

    await use(page)

    // Final check: no console errors
    if (consoleErrors.length > 0) {
      throw new Error(
        `Console errors during test:\n${consoleErrors.join('\n')}`
      )
    }
  },
})

export { expect }
