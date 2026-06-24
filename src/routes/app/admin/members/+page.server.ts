import { fail } from '@sveltejs/kit'
import { apiGet, apiPost, apiDelete } from '$lib/server/api'
import type { PageServerLoad, Actions } from './$types'

type TMember = {
  readonly userId: string
  readonly email: string
  readonly name: string
  readonly role: string
  readonly joinedAt: string
}

type TInvite = {
  readonly id: string
  readonly email: string
  readonly role: string
  readonly token: string
  readonly createdAt: string
  readonly expiresAt: string
}

export const load: PageServerLoad = async ({ parent, locals, cookies }) => {
  const { activeOrgId } = await parent()
  const orgId = activeOrgId ?? cookies.get('gittan-active-org')
  if (!orgId || !locals.session) return { members: [], invites: [] }

  try {
    const [members, invites] = await Promise.all([
      apiGet<TMember[]>(`/orgs/${orgId}/members`, locals.session),
      apiGet<TInvite[]>(`/orgs/${orgId}/invites`, locals.session),
    ])
    return { members, invites }
  } catch {
    return { members: [], invites: [] }
  }
}

export const actions: Actions = {
  invite: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    const data = await request.formData()
    const email = (data.get('email') as string)?.trim()
    const role = (data.get('role') as string) || 'member'

    if (!email) return fail(400, { error: 'Email is required' })

    try {
      await apiPost(`/orgs/${orgId}/invites`, locals.session, { email, role })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send invite'
      return fail(500, { error: message })
    }

    return { invited: true }
  },

  revoke: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    const data = await request.formData()
    const inviteId = data.get('inviteId') as string
    if (!inviteId) return fail(400, { error: 'Invite ID is required' })

    try {
      await apiDelete(`/orgs/${orgId}/invites/${inviteId}`, locals.session)
    } catch {
      return fail(500, { error: 'Failed to revoke invite' })
    }

    return { revoked: true }
  },

  remove: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    const data = await request.formData()
    const userId = data.get('userId') as string
    if (!userId) return fail(400, { error: 'User ID is required' })

    try {
      await apiDelete(`/orgs/${orgId}/members/${userId}`, locals.session)
    } catch {
      return fail(500, { error: 'Failed to remove member' })
    }

    return { removed: true }
  },
}
