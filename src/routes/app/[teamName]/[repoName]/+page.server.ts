import type { PageServerLoad } from './$types'
import { apiGet } from '$lib/server/api'
import type { TFileEntry, TBranch, TCommit } from '$lib/types'

export const load: PageServerLoad = async ({ parent, locals }) => {
  const { repo } = await parent()
  const orgName = repo.forgejoFullName.split('/')[0]

  const [entries, branches, commits] = await Promise.all([
    apiGet<TFileEntry[]>(
      `/repos/${orgName}/${repo.name}/contents?path=&ref=main`,
      locals.session!,
    ).catch(() => [] as TFileEntry[]),
    apiGet<TBranch[]>(
      `/repos/${orgName}/${repo.name}/branches`,
      locals.session!,
    ).catch(() => [] as TBranch[]),
    apiGet<TCommit[]>(
      `/repos/${orgName}/${repo.name}/commits?ref=main&limit=10`,
      locals.session!,
    ).catch(() => [] as TCommit[]),
  ])

  return {
    entries,
    branches,
    commits,
    currentRef: 'main',
    currentPath: '',
  }
}
