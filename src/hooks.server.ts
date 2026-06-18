import type { Handle } from '@sveltejs/kit'
import { getSession, setSession } from '$lib/server/session'
import { refreshAccessToken } from '$lib/server/oauth'

const TOKEN_REFRESH_BUFFER_MS = 60 * 1000

export const handle: Handle = async ({ event, resolve }) => {
  const session = getSession(event.cookies)

  if (!session) {
    event.locals.session = null
    return resolve(event)
  }

  const now = Date.now()
  const needsRefresh = session.expiresAt - now < TOKEN_REFRESH_BUFFER_MS

  if (needsRefresh) {
    try {
      const tokens = await refreshAccessToken(session.refreshToken)
      const refreshed = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
      }
      setSession(event.cookies, refreshed)
      event.locals.session = refreshed
    } catch {
      event.locals.session = session
    }
  } else {
    event.locals.session = session
  }

  return resolve(event)
}
