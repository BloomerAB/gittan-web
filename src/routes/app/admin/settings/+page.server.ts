import { fail } from '@sveltejs/kit'
import { apiPut } from '$lib/server/api'
import type { PageServerLoad, Actions } from './$types'
import type { TOrg } from '$lib/types'

export const load: PageServerLoad = async ({ parent, locals, cookies }) => {
  const { orgs, activeOrgId } = await parent()
  const orgId = activeOrgId
  if (!orgId || !locals.session) return { org: null }

  const org = orgs.find((o: TOrg) => o.id === orgId) ?? null
  return { org }
}

export const actions: Actions = {
  saveSettings: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    const data = await request.formData()
    const displayName = data.get('displayName') as string

    try {
      await apiPut(`/orgs/${orgId}`, locals.session, { displayName })
      return { saved: true }
    } catch {
      return fail(500, { error: 'Failed to save settings' })
    }
  },
}
