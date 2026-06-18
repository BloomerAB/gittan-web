import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'
import { apiPost, apiPut } from '$lib/server/api'

const VALID_TOPOLOGIES = ['stream-aligned', 'platform', 'enabling', 'complicated-subsystem']

export const actions: Actions = {
  create: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Not authenticated' })

    const form = await request.formData()
    const name = form.get('name')?.toString()?.trim()
    const displayName = form.get('displayName')?.toString()?.trim()
    const topology = form.get('topology')?.toString()?.trim() || 'stream-aligned'

    if (!name || !displayName) {
      return fail(400, { error: 'Name and display name are required' })
    }

    if (!/^[a-z0-9-]+$/.test(name)) {
      return fail(400, { error: 'Name must be lowercase alphanumeric with dashes' })
    }

    if (!VALID_TOPOLOGIES.includes(topology)) {
      return fail(400, { error: 'Invalid topology value' })
    }

    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active organization' })

    try {
      await apiPost(`/orgs/${orgId}/teams`, locals.session, { name, displayName, topology })
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
    const topology = form.get('topology')?.toString()?.trim()
    const slackChannel = form.get('slackChannel')?.toString()?.trim()

    if (!teamId) return fail(400, { error: 'teamId required' })

    if (topology && !VALID_TOPOLOGIES.includes(topology)) {
      return fail(400, { error: 'Invalid topology value' })
    }

    const updates: Record<string, string> = {}
    if (displayName) updates.displayName = displayName
    if (topology) updates.topology = topology
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
