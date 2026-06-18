import { json, error } from '@sveltejs/kit'
import { apiGet, apiPost } from '$lib/server/api'
import type { TTeamMember } from '$lib/types'
import type { RequestHandler } from './$types'

type TUserByEmail = {
  id: string
  email: string
}

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.session) throw error(401, 'Unauthorized')

  const body: unknown = await request.json()
  if (
    typeof body !== 'object' ||
    body === null ||
    !('teamId' in body) ||
    !('email' in body)
  ) {
    throw error(400, 'teamId and email required')
  }

  const { teamId, email, role } = body as { teamId: string; email: string; role?: string }

  if (!teamId || !email) throw error(400, 'teamId and email required')

  const validRoles = ['admin', 'member']
  const memberRole = role && validRoles.includes(role) ? role : 'member'

  // Resolve email → userId
  let userId: string
  try {
    const user = await apiGet<TUserByEmail | TUserByEmail[]>(
      `/users/by-email/${encodeURIComponent(email)}`,
      locals.session,
    )
    const resolved = Array.isArray(user) ? user[0] : user
    if (!resolved?.id) throw error(404, 'User not found')
    userId = resolved.id
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) throw err
    throw error(404, 'User not found')
  }

  try {
    const member = await apiPost<TTeamMember>(
      `/teams/${teamId}/members`,
      locals.session,
      { userId, role: memberRole },
    )
    return json(member)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add member'
    throw error(500, message)
  }
}
