import type { PageServerLoad } from './$types'
import { apiGet } from '$lib/server/api'
import type { TFileEntry, TBranch, TCommit } from '$lib/types'

export const load: PageServerLoad = async ({ params, url, parent, locals }) => {
  const { repo } = await parent()
  const orgName = repo.forgejoFullName.split('/')[0]
  const ref = url.searchParams.get('ref') ?? 'main'
  const filePath = params.path ?? ''

  const [entries, branches, commits, fileContent] = await Promise.all([
    apiGet<TFileEntry[]>(
      `/repos/${orgName}/${repo.name}/contents?path=${encodeURIComponent(filePath)}&ref=${ref}`,
      locals.session!,
    ).catch(() => [] as TFileEntry[]),
    apiGet<TBranch[]>(
      `/repos/${orgName}/${repo.name}/branches`,
      locals.session!,
    ).catch(() => [] as TBranch[]),
    apiGet<TCommit[]>(
      `/repos/${orgName}/${repo.name}/commits?ref=${ref}&limit=10`,
      locals.session!,
    ).catch(() => [] as TCommit[]),
    apiGet<string>(
      `/repos/${orgName}/${repo.name}/file?path=${encodeURIComponent(filePath)}&ref=${ref}`,
      locals.session!,
    ).catch(() => null),
  ])

  const isFile = entries.length === 0 && fileContent !== null

  return {
    entries: isFile ? [] : entries,
    branches,
    commits,
    currentRef: ref,
    currentPath: filePath,
    fileContent: isFile ? fileContent : null,
  }
}
