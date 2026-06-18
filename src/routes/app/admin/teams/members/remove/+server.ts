import { json, error } from '@sveltejs/kit'
import { apiDelete } from '$lib/server/api'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.session) throw error(401, 'Unauthorized')

  const body: unknown = await request.json()
  if (
    typeof body !== 'object' ||
    body === null ||
    !('teamId' in body) ||
    !('userId' in body)
  ) {
    throw error(400, 'teamId and userId required')
  }

  const { teamId, userId } = body as { teamId: string; userId: string }

  if (!teamId || !userId) throw error(400, 'teamId and userId required')

  try {
    await apiDelete(`/teams/${teamId}/members/${userId}`, locals.session)
    return json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to remove member'
    throw error(500, message)
  }
}
