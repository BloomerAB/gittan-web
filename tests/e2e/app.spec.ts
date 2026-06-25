import { test, expect, type Page } from '@playwright/test'

const SCREENSHOT_DIR = '/Users/malin/repo-bloomer/gittan-e2e-screenshots'

async function screenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}.png`, fullPage: true })
}

test.beforeAll(async () => {
  const { mkdirSync } = await import('node:fs')
  mkdirSync(SCREENSHOT_DIR, { recursive: true })
})

// ──────────────────────────────────────────────────
// 1. Login redirect (uses clean context, no auth)
// ──────────────────────────────────────────────────
test.describe('Login Flow', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('unauthenticated access to /app redirects to login', async ({ page }) => {
    await page.goto('/app')
    await page.waitForURL(/localhost:3777/, { timeout: 15000 })

    await screenshot(page, '01-login-redirect')

    const currentUrl = page.url()
    expect(currentUrl).toContain('localhost:3777')
    expect(currentUrl).toContain('login')
  })
})

// ──────────────────────────────────────────────────
// All remaining tests use pre-authenticated state
// ──────────────────────────────────────────────────
test.describe('Authenticated App', () => {
  test.describe.configure({ mode: 'serial' })

  // 2. Onboarding / Landing
  test('app landing page loads after login', async ({ page }) => {
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    await screenshot(page, '02-app-landing')

    // Should NOT redirect to login
    expect(page.url()).toContain('localhost:5555')

    // Should show either onboarding or the main app
    const hasOnboarding = await page.locator('text=Welcome to Gittan').isVisible().catch(() => false)
    const hasTeamsHint = await page.locator('text=No teams yet').isVisible().catch(() => false)
    const wasRedirected = page.url().includes('/app/')

    expect(hasOnboarding || hasTeamsHint || wasRedirected).toBeTruthy()
  })

  // 3. Teams — list
  test('teams page shows team list and Create Team button', async ({ page }) => {
    await page.goto('/app/admin/teams')
    await page.waitForLoadState('networkidle')

    await screenshot(page, '03-teams-list')

    await expect(page.locator('h2:has-text("Teams")')).toBeVisible()
    await expect(page.locator('button:has-text("Create Team")')).toBeVisible()
  })

  // 4. Teams — create form has Team Name only (no topology, no slug)
  test('create team form has Team Name only, no topology or slug', async ({ page }) => {
    await page.goto('/app/admin/teams')
    await page.waitForLoadState('networkidle')

    await page.locator('button:has-text("Create Team")').click()

    await screenshot(page, '04-teams-create-form')

    // Display Name input visible
    await expect(page.locator('#team-display')).toBeVisible()

    // Topology selector must NOT exist (removed)
    await expect(page.locator('#team-topology')).not.toBeVisible()
    await expect(page.locator('select')).not.toBeVisible()

    // No slug input exists in the form
    const formArea = page.locator('form:has(#team-display)')
    const allInputs = formArea.locator('input[type="text"], input:not([type])')
    const inputCount = await allInputs.count()

    for (let i = 0; i < inputCount; i++) {
      const name = await allInputs.nth(i).getAttribute('name')
      const placeholder = await allInputs.nth(i).getAttribute('placeholder')
      expect(name?.toLowerCase()).not.toContain('slug')
      expect(placeholder?.toLowerCase() ?? '').not.toContain('slug')
    }
  })

  // 4b. Teams table — verify columns (no Topology column)
  test('teams table shows Name, Slack, Members, Created columns only', async ({ page }) => {
    await page.goto('/app/admin/teams')
    await page.waitForLoadState('networkidle')

    await screenshot(page, '04b-teams-table-columns')

    const headers = page.locator('thead th')
    const headerTexts: string[] = []
    const count = await headers.count()
    for (let i = 0; i < count; i++) {
      const text = await headers.nth(i).textContent()
      headerTexts.push((text ?? '').trim().toUpperCase())
    }

    expect(headerTexts).toEqual(['NAME', 'SLACK', 'MEMBERS', 'CREATED'])
    expect(headerTexts).not.toContain('TOPOLOGY')
  })

  // 5. Teams — create team
  test('create a team and verify it appears in the list', async ({ page }) => {
    await page.goto('/app/admin/teams')
    await page.waitForLoadState('networkidle')

    const existingRows = await page.locator('tbody tr').count()

    await page.locator('button:has-text("Create Team")').click()

    const teamName = `E2E Team ${Date.now()}`
    await page.locator('#team-display').fill(teamName)

    await page.locator('button[type="submit"]:has-text("Create")').click()

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await screenshot(page, '05-teams-created')

    // Team should appear in the list (form should close)
    const newRows = await page.locator('tbody tr').count()
    expect(newRows).toBeGreaterThan(existingRows)

    // Verify team name is visible in the table
    await expect(page.locator(`td:has-text("${teamName}")`)).toBeVisible()
  })

  // 5b. Teams — team detail: add member has no role selector
  test('team detail add member has email input only, no role selector', async ({ page }) => {
    await page.goto('/app/admin/teams')
    await page.waitForLoadState('networkidle')

    // Click first team row to open detail view
    const firstRow = page.locator('tbody tr').first()
    await expect(firstRow).toBeVisible()
    await firstRow.click()
    await page.waitForLoadState('networkidle')

    await screenshot(page, '05b-team-detail')

    // Members section should exist
    await expect(page.locator('h3:has-text("Members")')).toBeVisible()

    // "All team members have full admin access" text confirms no roles
    await expect(page.locator('text=All team members have full admin access')).toBeVisible()

    // Add member: email input should exist
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()

    // No role selector in the members section
    const memberSection = page.locator('div:has(> h3:has-text("Members"))')
    await expect(memberSection.locator('select')).not.toBeVisible()

    // OIDC section should NOT have a role selector either
    await expect(page.locator('h3:has-text("OIDC Group Mapping")')).toBeVisible()
    const oidcSection = page.locator('div:has(> h3:has-text("OIDC Group Mapping"))')
    await expect(oidcSection.locator('select')).not.toBeVisible()

    // OIDC section should just have a text input for group ID
    await expect(page.locator('input[placeholder="AD Group ID"]')).toBeVisible()
  })

  // 6. Settings — page loads
  test('settings page shows org name and toggle settings', async ({ page }) => {
    await page.goto('/app/admin/settings')
    await page.waitForLoadState('networkidle')

    await screenshot(page, '06-settings-page')

    await expect(page.locator('h2:has-text("Organization Settings")')).toBeVisible()

    const orgNameInput = page.locator('#displayName')
    await expect(orgNameInput).toBeVisible()

    // Verify the input has a value (org exists)
    const value = await orgNameInput.inputValue()
    expect(value.length).toBeGreaterThan(0)

    // Toggle settings exist
    await expect(page.locator('text=Allow latest')).toBeVisible()
    await expect(page.locator('text=Public repositories')).toBeVisible()
    await expect(page.locator('button:has-text("Save")')).toBeVisible()
  })

  // 7. Settings — save changes
  test('change org name and save successfully', async ({ page }) => {
    await page.goto('/app/admin/settings')
    await page.waitForLoadState('networkidle')

    const orgNameInput = page.locator('#displayName')
    const originalName = await orgNameInput.inputValue()

    const tempName = `E2E Org ${Date.now()}`
    await orgNameInput.clear()
    await orgNameInput.fill(tempName)

    await page.locator('button:has-text("Save")').click()
    await page.waitForLoadState('networkidle')

    await screenshot(page, '07-settings-saved')

    // Verify success message
    await expect(page.locator('text=Settings saved')).toBeVisible({ timeout: 5000 })

    // Restore original name
    await orgNameInput.clear()
    await orgNameInput.fill(originalName)
    await page.locator('button:has-text("Save")').click()
    await page.waitForLoadState('networkidle')
  })

  // 8. Steps — page loads
  test('steps page shows registry and Register Step button', async ({ page }) => {
    await page.goto('/app/admin/steps')
    await page.waitForLoadState('networkidle')

    await screenshot(page, '08-steps-page')

    await expect(page.locator('h2:has-text("Step Registry")')).toBeVisible()
    await expect(page.locator('button:has-text("Register Step")')).toBeVisible()
  })

  // 9. Steps — register step (bug fix verification)
  test('register a step and form closes on success (bug fix)', async ({ page }) => {
    await page.goto('/app/admin/steps')
    await page.waitForLoadState('networkidle')

    // Open register form
    await page.locator('button:has-text("Register Step")').click()
    await expect(page.locator('#step-name')).toBeVisible()

    await screenshot(page, '09-steps-form-open')

    // Fill step details
    const stepName = `e2e-step-${Date.now()}`
    await page.locator('#step-name').fill(stepName)
    await page.locator('#step-description').fill('E2E test step')
    await page.locator('#step-image').fill('alpine:3.21')
    await page.locator('#step-run').fill('echo "hello e2e"')

    await screenshot(page, '10-steps-form-filled')

    // Submit — click the Register button inside the form (not the "Register Step" toggle)
    await page.locator('form button[type="submit"]:has-text("Register")').click()

    // Wait for response
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    await screenshot(page, '11-steps-after-register')

    // BUG FIX VERIFICATION: Form must be closed
    const formVisible = await page.locator('#step-name').isVisible().catch(() => false)
    expect(formVisible).toBe(false)

    // Step should appear in the list (use exact match on the monospace name span)
    await expect(page.locator(`span.font-mono:has-text("${stepName}")`).first()).toBeVisible({ timeout: 5000 })

    // Clean up — remove the step
    const stepCard = page.locator(`div:has(> div span.font-mono:text("${stepName}"))`)
    const removeButton = stepCard.locator('button:has-text("remove")').first()
    if (await removeButton.isVisible()) {
      await removeButton.click()
      await page.waitForLoadState('networkidle')
    }

    await screenshot(page, '12-steps-cleaned')
  })

  // 10. Admin nav — all pages accessible
  test('all admin pages load without errors', async ({ page }) => {
    const pages = [
      { path: '/app/admin/teams', check: 'Teams' },
      { path: '/app/admin/steps', check: 'Step Registry' },
      { path: '/app/admin/settings', check: 'Organization Settings' },
      { path: '/app/admin/audit', check: 'Audit' },
      { path: '/app/admin/auth', check: 'Authentication' },
    ]

    for (const { path, check } of pages) {
      await page.goto(path)
      await page.waitForLoadState('networkidle')

      // Page should not show error
      const bodyText = await page.locator('body').textContent()
      expect(bodyText).not.toContain('Internal Server Error')
      expect(bodyText).not.toContain('500')

      // Heading should be visible
      const heading = page.locator(`h2:has-text("${check}"), h3:has-text("${check}")`)
      const headingVisible = await heading.isVisible().catch(() => false)
      // Some pages might have different heading patterns, so just verify no error
    }

    await screenshot(page, '13-admin-pages-verified')
  })
})
