import { fail } from '@sveltejs/kit'
import { apiGet, apiPut } from '$lib/server/api'
import type { PageServerLoad, Actions } from './$types'

type TPlan = {
  readonly orgId: string
  readonly plan: string
  readonly spendingCapEur: number
  readonly ciMinutesLimit: number
  readonly storageLimitGb: number
  readonly aiEnabled: boolean
  readonly receiptEmail?: string
}

type TUsage = {
  readonly orgId: string
  readonly month: string
  readonly ciMinutesUsed: number
  readonly ciMinutesLimit: number
  readonly storageBytes: number
}

type TReceipt = {
  readonly id: string
  readonly month: string
  readonly amountEur: number
  readonly plan: string
  readonly createdAt: string
}

export const load: PageServerLoad = async ({ parent, locals }) => {
  const { activeOrgId } = await parent()
  if (!activeOrgId || !locals.session) return { plan: null, usage: null, receipts: [] as TReceipt[] }

  try {
    const [plan, usage, receipts] = await Promise.all([
      apiGet<TPlan>(`/orgs/${activeOrgId}/plan`, locals.session),
      apiGet<TUsage>(`/orgs/${activeOrgId}/usage`, locals.session),
      apiGet<TReceipt[]>(`/orgs/${activeOrgId}/receipts`, locals.session).catch(() => [] as TReceipt[]),
    ])
    return { plan, usage, receipts }
  } catch {
    return { plan: null, usage: null, receipts: [] as TReceipt[] }
  }
}

export const actions: Actions = {
  updateReceiptEmail: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    const data = await request.formData()
    const receiptEmail = (data.get('receiptEmail') as string)?.trim()
    if (!receiptEmail) return fail(400, { error: 'Receipt email is required' })

    try {
      await apiPut(`/orgs/${orgId}/plan`, locals.session, { receiptEmail })
      return { updated: true }
    } catch {
      return fail(500, { error: 'Failed to update receipt email' })
    }
  },

  changePlan: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    const data = await request.formData()
    const plan = data.get('plan') as string
    if (!['personal', 'starter', 'team'].includes(plan)) {
      return fail(400, { error: 'Invalid plan' })
    }

    try {
      await apiPut(`/orgs/${orgId}/plan`, locals.session, { plan })
      return { planChanged: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change plan'
      if (message.includes('Cannot downgrade')) {
        try {
          const parsed = JSON.parse(message.split(': ').slice(1).join(': '))
          return fail(409, { error: 'Cannot downgrade plan', violations: parsed.violations })
        } catch {
          return fail(409, { error: message })
        }
      }
      return fail(500, { error: message })
    }
  },

  updateSpendingCap: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    const data = await request.formData()
    const spendingCapEur = parseInt(data.get('spendingCapEur') as string, 10)
    if (isNaN(spendingCapEur) || spendingCapEur < 0 || spendingCapEur > 10_000) {
      return fail(400, { error: 'Spending cap must be between €0 and €10,000' })
    }

    try {
      await apiPut(`/orgs/${orgId}/plan`, locals.session, { spendingCapEur })
      return { updated: true }
    } catch {
      return fail(500, { error: 'Failed to update spending cap' })
    }
  },
}
