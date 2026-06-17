import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'
import { apiPost } from '$lib/server/api'

export const actions: Actions = {
  create: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Not authenticated' })

    const form = await request.formData()
    const name = form.get('name')?.toString()?.trim()
    const displayName = form.get('displayName')?.toString()?.trim()

    if (!name || !displayName) {
      return fail(400, { error: 'Name and display name are required' })
    }

    if (!/^[a-z0-9-]+$/.test(name)) {
      return fail(400, { error: 'Name must be lowercase alphanumeric with dashes' })
    }

    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active organization' })

    try {
      await apiPost(`/orgs/${orgId}/teams`, locals.session, { name, displayName })
      return { created: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create team'
      return fail(500, { error: message })
    }
  },
}
