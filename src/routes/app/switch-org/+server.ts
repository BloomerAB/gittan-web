import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { orgId } = await request.json()
  cookies.set('gittan-active-org', orgId, {
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  return json({ ok: true })
}
