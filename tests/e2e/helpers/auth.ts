import { type Page, expect } from '@playwright/test'
import { execSync } from 'node:child_process'

const TEST_EMAIL = 'mal.nordstrom@gmail.com'

/**
 * Extract the latest OTP code from the auth-server docker logs.
 * The auth-server logs: "OTP for <email>: <code>"
 */
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

/**
 * Perform full login flow:
 * 1. Navigate to /app (redirects to login-web)
 * 2. Enter email, request OTP
 * 3. Extract OTP from docker logs
 * 4. Enter OTP, complete login
 * 5. Wait for redirect back to /app
 */
export async function loginWithOtp(page: Page): Promise<void> {
  // Navigate to /app — will redirect through /auth/login to login-web
  await page.goto('/app')

  // We should be redirected to the login-web at localhost:3777
  await page.waitForURL(/localhost:3777/, { timeout: 15000 })

  // Wait for the login form to be ready
  // The login-web is a React SPA — wait for an email input to appear
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]')
  await emailInput.waitFor({ state: 'visible', timeout: 10000 })
  await emailInput.fill(TEST_EMAIL)

  // Click the submit/continue button to send OTP
  const submitButton = page.locator('button[type="submit"]')
  await submitButton.click()

  // Wait for OTP input to appear (the form transitions to OTP entry)
  // Give the auth-server time to log the OTP
  await page.waitForTimeout(1500)

  // Get OTP from docker logs
  const otp = getOtpFromLogs(TEST_EMAIL)

  // Find OTP input(s) — could be a single input or multiple digit inputs
  const otpInput = page.locator('input[name="otp"], input[autocomplete="one-time-code"], input[inputmode="numeric"]').first()
  const otpInputVisible = await otpInput.isVisible().catch(() => false)

  if (otpInputVisible) {
    await otpInput.fill(otp)
  } else {
    // Try individual digit inputs (common OTP UI pattern)
    const digitInputs = page.locator('input[maxlength="1"]')
    const count = await digitInputs.count()
    if (count > 0) {
      for (let i = 0; i < otp.length && i < count; i++) {
        await digitInputs.nth(i).fill(otp[i])
      }
    }
  }

  // Submit the OTP — might auto-submit or need a button click
  const verifyButton = page.locator('button[type="submit"]')
  if (await verifyButton.isVisible()) {
    await verifyButton.click()
  }

  // Wait for redirect back to the app
  await page.waitForURL(/localhost:5555/, { timeout: 20000 })
}

/**
 * Check if already logged in by visiting /app and seeing if we get redirected.
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  const response = await page.goto('/app')
  const url = page.url()
  return url.includes('localhost:5555')
}

/**
 * Ensure user is logged in. If not, perform login flow.
 */
export async function ensureLoggedIn(page: Page): Promise<void> {
  await page.goto('/app')

  // Wait a bit for redirects to settle
  await page.waitForTimeout(1000)

  const currentUrl = page.url()
  if (currentUrl.includes('localhost:3777') || currentUrl.includes('/auth/login')) {
    // Need to login
    await loginWithOtp(page)
  }

  // At this point we should be on the app
  await expect(page).toHaveURL(/localhost:5555/)
}
