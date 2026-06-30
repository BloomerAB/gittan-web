import type { PageServerLoad } from './$types'
import { apiGet } from '$lib/server/api'

type TStep = {
  name: string
  image: string
  run: string
  description?: string
  cache?: string[]
}

export const load: PageServerLoad = async ({ params, parent, locals }) => {
  const { teams, activeOrgId } = await parent()
  const team = teams.find((t: any) => t.name === params.teamName)
  const orgId = team?.orgId ?? activeOrgId

  if (!orgId || !locals.session) {
    return { steps: [], teamName: params.teamName }
  }

  const steps = await apiGet<TStep[]>(`/orgs/${orgId}/steps`, locals.session).catch(() => [])
  return { steps, teamName: params.teamName }
}
