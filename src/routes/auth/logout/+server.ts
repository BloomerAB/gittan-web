import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { clearSession, getSession } from '$lib/server/session'
import { revokeToken } from '$lib/server/oauth'

export const GET: RequestHandler = async ({ cookies }) => {
  const session = getSession(cookies)

  if (session) {
    await Promise.all([
      revokeToken(session.accessToken),
      revokeToken(session.refreshToken),
    ])
  }

  clearSession(cookies)
  redirect(302, '/')
}
