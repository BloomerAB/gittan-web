import { apiGet } from '$lib/server/api'
import type { PageServerLoad } from './$types'

type TPipelineStep = {
  readonly stepName: string
  readonly status: string
  readonly durationMs: number
  readonly source?: string
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

export const load: PageServerLoad = async ({ parent, locals }) => {
  const { repo } = await parent()
  if (!locals.session) return { runs: [] }

  const orgId = repo.orgId
  const repoId = repo.id

  try {
    const runs = await apiGet<TPipelineRun[]>(`/orgs/${orgId}/repos/${repoId}/pipelines`, locals.session)
    return { runs }
  } catch {
    return { runs: [] }
  }
}
