import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { buildAuthorizeUrl } from '$lib/server/oauth'
import { setStateCookie } from '$lib/server/session'

export const GET: RequestHandler = ({ cookies }) => {
  const { url, state } = buildAuthorizeUrl()
  setStateCookie(cookies, state)
  redirect(302, url)
}
