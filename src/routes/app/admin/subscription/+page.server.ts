import { fail } from '@sveltejs/kit'
import { apiGet, apiPut } from '$lib/server/api'
import type { PageServerLoad, Actions } from './$types'

type TPlan = {
  readonly orgId: string
  readonly plan: string
  readonly ciBlocks: number
  readonly ciMinutesLimit: number
  readonly storageLimitGb: number
  readonly userLimit: number
  readonly teamLimit: number
  readonly repoLimit: number
  readonly billingEmail?: string
}

type TUsage = {
  readonly orgId: string
  readonly month: string
  readonly ciMinutesUsed: number
  readonly ciMinutesLimit: number
  readonly storageBytes: number
  readonly userCount: number
  readonly teamCount: number
  readonly repoCount: number
}

export const load: PageServerLoad = async ({ parent, locals }) => {
  const { activeOrgId } = await parent()
  if (!activeOrgId || !locals.session) return { plan: null, usage: null }

  try {
    const [plan, usage] = await Promise.all([
      apiGet<TPlan>(`/orgs/${activeOrgId}/plan`, locals.session),
      apiGet<TUsage>(`/orgs/${activeOrgId}/usage`, locals.session),
    ])
    return { plan, usage }
  } catch {
    return { plan: null, usage: null }
  }
}

export const actions: Actions = {
  updateBillingEmail: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    const data = await request.formData()
    const billingEmail = (data.get('billingEmail') as string)?.trim()
    if (!billingEmail) return fail(400, { error: 'Billing email is required' })

    try {
      await apiPut(`/orgs/${orgId}/plan`, locals.session, { billingEmail })
      return { updated: true }
    } catch {
      return fail(500, { error: 'Failed to update billing email' })
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
    } catch {
      return fail(500, { error: 'Failed to change plan' })
    }
  },
}
