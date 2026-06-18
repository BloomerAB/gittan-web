import { json, error } from '@sveltejs/kit'
import { apiGet } from '$lib/server/api'
import type { RequestHandler } from './$types'

type TUserSearchResult = {
  id: string
  email: string
  name: string
}

export const GET: RequestHandler = async ({ url, locals, cookies }) => {
  if (!locals.session) throw error(401, 'Unauthorized')

  const orgId = cookies.get('gittan-active-org')
  if (!orgId) throw error(400, 'No active organization')

  const q = url.searchParams.get('q') ?? ''

  const results = await apiGet<TUserSearchResult[]>(
    `/orgs/${orgId}/users/search?q=${encodeURIComponent(q)}`,
    locals.session,
  )

  return json(results)
}
