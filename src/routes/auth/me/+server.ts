import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { clearSession } from '$lib/server/session'
import { config } from '$lib/server/config'

export const GET: RequestHandler = async ({ locals, cookies }) => {
  if (!locals.session) {
    return json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const response = await fetch(`${config.authApiUrl}/oauth/userinfo`, {
      headers: { Authorization: `Bearer ${locals.session.accessToken}` },
    })

    if (!response.ok) {
      clearSession(cookies)
      return json({ error: 'Session expired' }, { status: 401 })
    }

    const user = await response.json()
    return json(user)
  } catch {
    return json({ error: 'Failed to fetch user info' }, { status: 500 })
  }
}
