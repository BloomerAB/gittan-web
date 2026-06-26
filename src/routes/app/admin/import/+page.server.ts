import { fail } from '@sveltejs/kit'
import { apiPost } from '$lib/server/api'
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ parent }) => {
  const { teams } = await parent()
  return { teams }
}

const doMigrate = async (orgId: string, session: any, formData: FormData, update: boolean) => {
  const githubUrl = (formData.get('githubUrl') as string)?.trim()
  const githubToken = (formData.get('githubToken') as string)?.trim()
  const teamId = formData.get('teamId') as string
  const teamName = (formData.get('teamName') as string) ?? ''

  if (!githubUrl) return fail(400, { error: 'GitHub URL is required' })
  if (!githubToken) return fail(400, { error: 'GitHub token is required' })
  if (!teamId) return fail(400, { error: 'Team is required' })

  if (!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(githubUrl)) {
    return fail(400, { error: 'Invalid GitHub URL. Expected: https://github.com/owner/repo' })
  }

  try {
    const result = await apiPost<{ name: string }>(`/orgs/${orgId}/repos/migrate`, session, {
      githubUrl,
      githubToken,
      teamId,
      private: true,
      update,
    })

    return { success: true, repoName: result.name, teamName, updated: update }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Migration failed'
    if (message.includes('already exists')) {
      return fail(409, { error: 'Repository already exists in gittan', canUpdate: true })
    }
    return fail(500, { error: message })
  }
}

export const actions: Actions = {
  migrate: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })
    return doMigrate(orgId, locals.session, await request.formData(), false)
  },

  update: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })
    return doMigrate(orgId, locals.session, await request.formData(), true)
  },
}
