import { fail } from '@sveltejs/kit'
import { apiGet, apiPut } from '$lib/server/api'
import type { PageServerLoad, Actions } from './$types'
import type { TOrg } from '$lib/types'

type TOrgSettings = TOrg & {
  allowLatest?: boolean
  publicRepos?: boolean
}

export const load: PageServerLoad = async ({ parent, locals }) => {
  const { orgs, activeOrgId } = await parent()
  const orgId = activeOrgId
  if (!orgId || !locals.session) return { org: null }

  try {
    const org = await apiGet<TOrgSettings>(`/orgs/${orgId}`, locals.session)
    return { org }
  } catch {
    const org = (orgs.find((o: TOrg) => o.id === orgId) as TOrgSettings | undefined) ?? null
    return { org }
  }
}

export const actions: Actions = {
  saveSettings: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    const data = await request.formData()
    const displayName = data.get('displayName') as string
    const allowLatest = data.get('allowLatest') === 'true'
    const publicRepos = data.get('publicRepos') === 'true'
    const pipelineScope = data.get('pipelineScope') as string

    try {
      await apiPut(`/orgs/${orgId}`, locals.session, { displayName, allowLatest, publicRepos, pipelineScope })
      return { saved: true }
    } catch {
      return fail(500, { error: 'Failed to save settings' })
    }
  },
}
