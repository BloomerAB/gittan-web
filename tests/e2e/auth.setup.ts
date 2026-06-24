import { test as setup, expect } from '@playwright/test'
import { execSync } from 'node:child_process'
import path from 'node:path'

const STORAGE_STATE = path.join(import.meta.dirname, '.auth/state.json')
const TEST_EMAIL = 'mal.nordstrom@gmail.com'

function getOtpFromLogs(email: string): string {
  const logs = execSync('docker logs local-dev-auth-server-1 2>&1', {
    encoding: 'utf-8',
    timeout: 5000,
  })

  const lines = logs.split('\n').reverse()
  for (const line of lines) {
    if (line.includes(`OTP for ${email}:`)) {
      const match = line.match(/OTP for .+:\s*(\d+)/)
      if (match) return match[1]
    }
  }
  throw new Error(`No OTP found in auth-server logs for ${email}`)
}

setup('authenticate', async ({ page }) => {
  await page.goto('/app')
  await page.waitForURL(/localhost:3777/, { timeout: 15000 })

  // Enter email
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]')
  await emailInput.waitFor({ state: 'visible', timeout: 10000 })
  await emailInput.fill(TEST_EMAIL)

  // Submit to send OTP
  await page.locator('button[type="submit"]').click()

  // Wait for auth-server to log OTP
  await page.waitForTimeout(2000)

  // Get OTP
  const otp = getOtpFromLogs(TEST_EMAIL)

  // Enter OTP — try different input patterns
  const otpInput = page.locator('input[name="otp"], input[autocomplete="one-time-code"], input[inputmode="numeric"]').first()
  const otpVisible = await otpInput.isVisible().catch(() => false)

  if (otpVisible) {
    await otpInput.fill(otp)
  } else {
    // Try digit-by-digit inputs
    const digitInputs = page.locator('input[maxlength="1"]')
    const count = await digitInputs.count()
    if (count > 0) {
      for (let i = 0; i < otp.length && i < count; i++) {
        await digitInputs.nth(i).fill(otp[i])
      }
    }
  }

  // Submit OTP
  const verifyButton = page.locator('button[type="submit"]')
  if (await verifyButton.isVisible()) {
    await verifyButton.click()
  }

  // Wait for redirect back to app
  await page.waitForURL(/localhost:5555/, { timeout: 20000 })
  await expect(page).toHaveURL(/localhost:5555/)

  // Save auth state
  await page.context().storageState({ path: STORAGE_STATE })
})
