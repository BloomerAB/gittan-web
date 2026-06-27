import { apiGet } from '$lib/server/api'
import type { PageServerLoad } from './$types'

type TPipelineStep = {
  readonly stepName: string
  readonly status: string
  readonly durationMs: number
  readonly source?: string
  readonly exitCode?: number
  readonly output?: string
  readonly error?: string
}

type TPipelineRun = {
  readonly id: string
  readonly repoId: string
  readonly pushEventId: string
  readonly orgId: string
  readonly teamId: string
  readonly branch: string
  readonly status: string
  readonly steps: readonly TPipelineStep[]
  readonly startedAt: string
  readonly finishedAt: string
}

type TForgejoContent = {
  readonly content?: string
  readonly encoding?: string
}

export const load: PageServerLoad = async ({ parent, locals }) => {
  const { repo } = await parent()
  if (!locals.session) return { runs: [], pipelineConfig: null }

  const orgId = repo.orgId
  const repoId = repo.id
  const [owner, repoName] = repo.forgejoFullName.split('/')

  const [runs, configResult] = await Promise.all([
    apiGet<TPipelineRun[]>(`/orgs/${orgId}/repos/${repoId}/pipelines`, locals.session).catch(() => []),
    apiGet<TForgejoContent>(`/repos/${owner}/${repoName}/contents?path=.gittan.yaml`, locals.session).catch(() => null),
  ])

  let pipelineConfig: string | null = null
  if (configResult?.content && configResult.encoding === 'base64') {
    pipelineConfig = Buffer.from(configResult.content, 'base64').toString('utf-8')
  }

  return { runs, pipelineConfig }
}
