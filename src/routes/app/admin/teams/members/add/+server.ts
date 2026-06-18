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
  if (typeof body !== 'object' || body === null || !('teamId' in body)) {
    throw error(400, 'teamId required')
  }

  const { teamId, userId: directUserId, email } = body as {
    teamId: string
    userId?: string
    email?: string
  }

  if (!teamId) throw error(400, 'teamId required')

  let userId: string

  if (directUserId) {
    userId = directUserId
  } else if (email) {
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
  } else {
    throw error(400, 'userId or email required')
  }

  try {
    const member = await apiPost<TTeamMember>(
      `/teams/${teamId}/members`,
      locals.session,
      { userId },
    )
    return json(member)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add member'
    throw error(500, message)
  }
}
