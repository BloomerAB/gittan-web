import { fail } from '@sveltejs/kit'
import { apiGet, apiPost, apiDelete } from '$lib/server/api'
import type { PageServerLoad, Actions } from './$types'

type TPolicyStep = {
  position: string
  name: string
  use?: string
}

type TPolicy = {
  id: string
  name: string
  description?: string
  matchFiles?: string
  matchTeam?: string
  matchName?: string
  steps?: TPolicyStep[]
}

type TStep = {
  name: string
  image: string
  run: string
  description?: string
}

export const load: PageServerLoad = async ({ parent, locals }) => {
  const { activeOrgId } = await parent()
  if (!activeOrgId || !locals.session) return { policies: [] as TPolicy[], steps: [] as TStep[] }

  try {
    const [policies, steps] = await Promise.all([
      apiGet<TPolicy[]>(`/orgs/${activeOrgId}/policies`, locals.session).catch(() => []),
      apiGet<TStep[]>(`/orgs/${activeOrgId}/steps`, locals.session).catch(() => []),
    ])
    return { policies: policies ?? [], steps: steps ?? [] }
  } catch {
    return { policies: [] as TPolicy[], steps: [] as TStep[] }
  }
}

export const actions: Actions = {
  createPolicy: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    const data = await request.formData()
    const name = data.get('name') as string
    const description = data.get('description') as string
    const matchFiles = data.get('matchFiles') as string
    const matchTeam = data.get('matchTeam') as string
    const matchName = data.get('matchName') as string
    const stepsRaw = data.get('steps') as string

    if (!name) return fail(400, { error: 'name is required' })

    let steps: TPolicyStep[] | undefined
    if (stepsRaw) {
      try {
        steps = JSON.parse(stepsRaw)
      } catch {
        return fail(400, { error: 'Invalid JSON in steps' })
      }
    }

    try {
      await apiPost(`/orgs/${orgId}/policies`, locals.session, {
        name,
        description: description || undefined,
        matchFiles: matchFiles || undefined,
        matchTeam: matchTeam || undefined,
        matchName: matchName || undefined,
        steps,
      })
      return { created: true }
    } catch {
      return fail(500, { error: 'Failed to create policy' })
    }
  },

  deletePolicy: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    const data = await request.formData()
    const policyId = data.get('policyId') as string
    if (!policyId) return fail(400, { error: 'policyId required' })

    try {
      await apiDelete(`/orgs/${orgId}/policies/${encodeURIComponent(policyId)}`, locals.session)
      return { deleted: true }
    } catch {
      return fail(500, { error: 'Failed to delete policy' })
    }
  },
}
