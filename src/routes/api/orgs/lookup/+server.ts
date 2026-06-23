import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { apiGet } from '$lib/server/api'

type TOrgLookup = {
  id: string
  name: string
  displayName: string
  oidcIssuer?: string
  mandatorySso?: boolean
  ssoEmailDomain?: string
}

export const GET: RequestHandler = async ({ url, locals }) => {
  const session = locals.session
  if (!session) return json({ error: 'Unauthorized' }, { status: 401 })

  const name = url.searchParams.get('name')
  if (!name) return json({ error: 'Missing name parameter' }, { status: 400 })

  try {
    const org = await apiGet<TOrgLookup>(`/orgs/by-name/${encodeURIComponent(name)}`, session)
    return json(org)
  } catch {
    return json({ error: 'Organization not found' }, { status: 404 })
  }
}
