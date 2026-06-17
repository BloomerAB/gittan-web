import { error } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import type { TTeam, TRepo } from '$lib/types'

export const load: LayoutServerLoad = async ({ params, parent }) => {
  const parentData = await parent()
  const teams = parentData.teams as TTeam[]
  const reposByTeam = parentData.reposByTeam as Record<string, TRepo[]>

  const team = teams.find(t => t.name === params.teamName)
  if (!team) error(404, 'Team not found')

  const repos = reposByTeam[team.id] ?? []
  const repo = repos.find(r => r.name === params.repoName)
  if (!repo) error(404, 'Repository not found')

  return { team, repo }
}
