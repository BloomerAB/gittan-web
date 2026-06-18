import { fail } from '@sveltejs/kit'
import { apiGet, apiPost, apiDelete } from '$lib/server/api'
import type { PageServerLoad, Actions } from './$types'

type TStep = {
  name: string
  image: string
  run: string
  description?: string
  defaults?: Record<string, string>
  cache?: string[]
}

export const load: PageServerLoad = async ({ parent, locals }) => {
  const { activeOrgId } = await parent()
  if (!activeOrgId || !locals.session) return { steps: [] as TStep[] }

  try {
    const steps = await apiGet<TStep[]>(`/orgs/${activeOrgId}/steps`, locals.session)
    return { steps: steps ?? [] }
  } catch {
    return { steps: [] as TStep[] }
  }
}

export const actions: Actions = {
  registerStep: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    const data = await request.formData()
    const name = data.get('name') as string
    const image = data.get('image') as string
    const run = data.get('run') as string
    const description = data.get('description') as string
    const defaultsRaw = data.get('defaults') as string
    const cacheRaw = data.get('cache') as string

    if (!name || !image || !run) return fail(400, { error: 'name, image, and run are required' })

    let defaults: Record<string, string> | undefined
    if (defaultsRaw) {
      try {
        defaults = JSON.parse(defaultsRaw)
      } catch {
        return fail(400, { error: 'Invalid JSON in defaults' })
      }
    }

    const cache = cacheRaw
      ? cacheRaw
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined

    try {
      await apiPost(`/orgs/${orgId}/steps`, locals.session, {
        name,
        image,
        run,
        description: description || undefined,
        defaults,
        cache,
      })
      return { registered: true }
    } catch {
      return fail(500, { error: 'Failed to register step' })
    }
  },

  deleteStep: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    const data = await request.formData()
    const name = data.get('name') as string
    if (!name) return fail(400, { error: 'name required' })

    try {
      await apiDelete(`/orgs/${orgId}/steps/${encodeURIComponent(name)}`, locals.session)
      return { deleted: true }
    } catch {
      return fail(500, { error: 'Failed to delete step' })
    }
  },
}
