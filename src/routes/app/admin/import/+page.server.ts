import { fail } from '@sveltejs/kit'
import { apiPost } from '$lib/server/api'
import type { PageServerLoad, Actions } from './$types'

const GITHUB_URL_RE = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/

const extractErrorMessage = (raw: string): string => {
  try {
    const parsed = JSON.parse(raw.replace(/^[^{]*/, ''))
    if (parsed.message) return parsed.message
    if (parsed.error) return parsed.error
  } catch { /* not JSON */ }

  if (raw.includes('403')) return 'GitHub denied access. Check your token permissions and lifetime.'
  if (raw.includes('404')) return 'Repository not found on GitHub. Check the URL and token scope.'
  return raw
}

const parseUrls = (input: string): string[] =>
  input
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)

export const load: PageServerLoad = async ({ parent }) => {
  const { teams } = await parent()
  return { teams }
}

type TRepoResult = {
  readonly url: string
  readonly name: string
  readonly status: 'success' | 'updated' | 'error'
  readonly error?: string
}

export const actions: Actions = {
  migrate: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    const data = await request.formData()
    const githubToken = (data.get('githubToken') as string)?.trim()
    const teamId = data.get('teamId') as string
    const teamName = (data.get('teamName') as string) ?? ''
    const update = data.get('update') === 'true'

    if (!githubToken) return fail(400, { error: 'GitHub token is required' })
    if (!teamId) return fail(400, { error: 'Team is required' })

    const urls = parseUrls((data.get('githubUrls') as string) ?? '')
    if (urls.length === 0) return fail(400, { error: 'At least one GitHub URL is required' })

    const invalid = urls.filter(u => !GITHUB_URL_RE.test(u))
    if (invalid.length > 0) {
      return fail(400, { error: `Invalid URL: ${invalid[0]}` })
    }

    const results: TRepoResult[] = []

    for (const url of urls) {
      const repoName = url.replace(/\.git$/, '').split('/').pop()?.toLowerCase() ?? url
      try {
        await apiPost(`/orgs/${orgId}/repos/migrate`, locals.session, {
          githubUrl: url,
          githubToken,
          teamId,
          private: true,
          update,
        })
        results.push({ url, name: repoName, status: update ? 'updated' : 'success' })
      } catch (err) {
        const raw = err instanceof Error ? err.message : 'Migration failed'
        results.push({ url, name: repoName, status: 'error', error: extractErrorMessage(raw) })
      }
    }

    const succeeded = results.filter(r => r.status !== 'error').length
    return { results, teamName, succeeded, total: results.length }
  },
}
