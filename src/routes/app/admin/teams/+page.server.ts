import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'
import { apiPost, apiPut } from '$lib/server/api'

export const actions: Actions = {
  create: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Not authenticated' })

    const form = await request.formData()
    const displayName = form.get('displayName')?.toString()?.trim()
    const slackChannel = form.get('slackChannel')?.toString()?.trim()

    if (!displayName) {
      return fail(400, { error: 'Team name is required' })
    }

    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active organization' })

    try {
      await apiPost(`/orgs/${orgId}/teams`, locals.session, {
        displayName,
        ...(slackChannel && { slackChannel }),
      })
      return { created: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create team'
      return fail(500, { error: message })
    }
  },

  updateTeam: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Not authenticated' })

    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active organization' })

    const form = await request.formData()
    const teamId = form.get('teamId')?.toString()?.trim()
    const displayName = form.get('displayName')?.toString()?.trim()
    const slackChannel = form.get('slackChannel')?.toString()?.trim()

    if (!teamId) return fail(400, { error: 'teamId required' })

    const updates: Record<string, string> = {}
    if (displayName) updates.displayName = displayName
    if (slackChannel !== undefined) updates.slackChannel = slackChannel ?? ''

    try {
      await apiPut(`/orgs/${orgId}/teams/${teamId}`, locals.session, updates)
      return { updated: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update team'
      return fail(500, { error: message })
    }
  },
}
