import { test, expect, type Page } from '@playwright/test'

const SCREENSHOT_DIR = '/Users/malin/repo-bloomer/gittan-e2e-screenshots'

async function screenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}.png`, fullPage: true })
}

test.describe('Members & Invites', () => {
  test.describe.configure({ mode: 'serial' })

  test('members page loads and shows current user', async ({ page }) => {
    await page.goto('/app/admin/members')
    await page.waitForLoadState('networkidle')

    await screenshot(page, 'members-01-page-load')

    await expect(page.locator('h2:has-text("Members")')).toBeVisible()
    await expect(page.locator('h3:has-text("Active members")')).toBeVisible()

    const bodyText = await page.locator('body').textContent()
    expect(bodyText).not.toContain('Internal Server Error')

    const memberRows = page.locator('h3:has-text("Active members") + div > div')
    const memberCount = await memberRows.count()
    expect(memberCount).toBeGreaterThanOrEqual(1)
  })

  test('members page shows in admin sidebar', async ({ page }) => {
    await page.goto('/app/admin/members')
    await page.waitForLoadState('networkidle')

    const sidebarLink = page.locator('nav a:has-text("Members")')
    await expect(sidebarLink).toBeVisible()

    const activeClass = await sidebarLink.getAttribute('class')
    expect(activeClass).toContain('bg-surface-900')
  })

  test('invite form is visible with email input and role selector', async ({ page }) => {
    await page.goto('/app/admin/members')
    await page.waitForLoadState('networkidle')

    await screenshot(page, 'members-02-invite-form')

    await expect(page.locator('h3:has-text("Invite a new member")')).toBeVisible()

    const emailInput = page.locator('input[name="email"]')
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveAttribute('type', 'email')

    const roleSelect = page.locator('select[name="role"]')
    await expect(roleSelect).toBeVisible()

    const sendButton = page.locator('button:has-text("Send invite")')
    await expect(sendButton).toBeVisible()
  })

  test('send invite creates a pending invite', async ({ page }) => {
    await page.goto('/app/admin/members')
    await page.waitForLoadState('networkidle')

    const inviteEmail = `e2e-test-${Date.now()}@example.com`

    await page.locator('input[name="email"]').fill(inviteEmail)
    await page.locator('select[name="role"]').selectOption('member')
    await page.locator('button:has-text("Send invite")').click()

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await screenshot(page, 'members-03-invite-sent')

    await expect(page.locator('text=Invite sent')).toBeVisible({ timeout: 5000 })

    await expect(page.locator('h3:has-text("Pending invites")')).toBeVisible()
    await expect(page.locator(`text=${inviteEmail}`)).toBeVisible()
  })

  test('revoke invite removes it from pending list', async ({ page }) => {
    await page.goto('/app/admin/members')
    await page.waitForLoadState('networkidle')

    const inviteEmail = `e2e-revoke-${Date.now()}@example.com`
    await page.locator('input[name="email"]').fill(inviteEmail)
    await page.locator('button:has-text("Send invite")').click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await expect(page.locator(`text=${inviteEmail}`)).toBeVisible()

    await screenshot(page, 'members-04-before-revoke')

    const inviteRow = page.locator('.divide-y > div', { has: page.locator(`text=${inviteEmail}`) })
    await inviteRow.locator('button:has-text("Revoke")').click()

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await screenshot(page, 'members-05-after-revoke')

    await expect(page.locator(`text=${inviteEmail}`)).not.toBeVisible()
  })

  test('owner cannot be removed', async ({ page }) => {
    await page.goto('/app/admin/members')
    await page.waitForLoadState('networkidle')

    await screenshot(page, 'members-06-owner-protection')

    const memberRows = page.locator('h3:has-text("Active members") + div > div')
    const count = await memberRows.count()
    let ownerHasRemoveButton = false

    for (let i = 0; i < count; i++) {
      const row = memberRows.nth(i)
      const isOwner = await row.locator('span:has-text("Owner")').isVisible().catch(() => false)
      if (isOwner) {
        const hasRemove = await row.locator('button:has-text("Remove")').isVisible().catch(() => false)
        if (hasRemove) ownerHasRemoveButton = true
        break
      }
    }

    expect(ownerHasRemoveButton).toBe(false)
  })

  test('invite with invalid email shows validation', async ({ page }) => {
    await page.goto('/app/admin/members')
    await page.waitForLoadState('networkidle')

    const emailInput = page.locator('input[name="email"]')
    await emailInput.fill('not-an-email')

    const sendButton = page.locator('button:has-text("Send invite")')
    await sendButton.click()

    await screenshot(page, 'members-07-invalid-email')

    const wasSubmitted = await page.locator('text=Invite sent').isVisible().catch(() => false)
    expect(wasSubmitted).toBe(false)
  })
})
