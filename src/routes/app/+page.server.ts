import { redirect, fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { apiPost } from '$lib/server/api'
import type { TOrg } from '$lib/types'

export const load: PageServerLoad = async ({ parent }) => {
  const { teams, orgs } = await parent()

  if (orgs.length === 0) {
    return { needsOnboarding: true as const }
  }

  if (teams.length > 0) {
    redirect(302, `/app/${teams[0].name}`)
  }

  return { needsOnboarding: false as const }
}

export const actions: Actions = {
  createOrg: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Not authenticated' })

    const form = await request.formData()
    const displayName = form.get('displayName')?.toString()?.trim()

    if (!displayName) {
      return fail(400, { error: 'Organization name is required' })
    }

    try {
      const org = await apiPost<TOrg>('/orgs', locals.session, { displayName })

      cookies.set('gittan-active-org', org.id, {
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })

      return { created: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create organization'
      return fail(500, { error: message })
    }
  },
}
