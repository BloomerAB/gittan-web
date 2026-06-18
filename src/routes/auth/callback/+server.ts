import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { exchangeCodeForTokens } from '$lib/server/oauth'
import { validateState } from '$lib/server/oauth'
import { setSession, getStateCookie, clearStateCookie } from '$lib/server/session'

export const GET: RequestHandler = async ({ url, cookies }) => {
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error || !code) {
    redirect(302, '/?auth_error=login_failed')
  }

  const expectedState = getStateCookie(cookies)
  clearStateCookie(cookies)

  if (!validateState(expectedState, state)) {
    redirect(302, '/?auth_error=invalid_state')
  }

  let tokens
  try {
    tokens = await exchangeCodeForTokens(code)
  } catch (err) {
    console.error('Token exchange failed:', err)
    redirect(302, '/?auth_error=token_exchange_failed')
  }

  setSession(cookies, {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  })
  redirect(302, '/app')
}
