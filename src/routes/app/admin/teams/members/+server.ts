import { json, error } from '@sveltejs/kit'
import { apiGet } from '$lib/server/api'
import type { TTeamMember } from '$lib/types'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals }) => {
  const teamId = url.searchParams.get('teamId')
  if (!teamId) throw error(400, 'teamId required')
  if (!locals.session) throw error(401, 'Unauthorized')

  try {
    const members = await apiGet<TTeamMember[]>(`/teams/${teamId}/members`, locals.session)
    return json(members)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load members'
    throw error(500, message)
  }
}
