export type TTeam = {
  id: string
  orgId: string
  name: string
  displayName: string
  slackChannel?: string
  createdAt: string
  updatedAt: string
}

export type TRepo = {
  id: string
  orgId: string
  teamId: string
  name: string
  forgejoFullName: string
  gatedBranches: string[]
  createdAt: string
  updatedAt: string
}

export type THealth = {
  status: "healthy" | "degraded"
  dependencies: Array<{ name: string; healthy: boolean }>
}

export type TRepoActivity = {
  repoId: string
  repoName: string
  lastCommit?: {
    sha: string
    message: string
    author: string
    timestamp: string
  }
}

export type TTeamMetrics = {
  teamId: string
  period: string
  pushFrequency: number
  avgPipelineLeadTimeMs: number
  pushRejectionRate: number
  avgRecoveryTimeMs: number
  totalPushes: number
  successfulPushes: number
  failedPushes: number
}

export type TFileEntry = {
  name: string
  path: string
  type: "file" | "dir"
  size?: number
}

export type TBranch = {
  name: string
}

export type TCommit = {
  sha: string
  message: string
  author: string
  timestamp: string
}

const API = "/api"

const get = async <T>(path: string): Promise<T> => {
  const res = await fetch(`${API}${path}`)
  if (!res.ok) throw new Error(`GET ${path}: ${res.status}`)
  return res.json()
}

export const api = {
  health: () => get<THealth>("/healthz"),
  teams: (orgId: string) => get<TTeam[]>(`/orgs/${orgId}/teams`),
  repos: (teamId: string) => get<TRepo[]>(`/teams/${teamId}/repos`),
  activity: (teamId: string) => get<TRepoActivity[]>(`/teams/${teamId}/activity`),
  metrics: (teamId: string) => get<TTeamMetrics>(`/teams/${teamId}/metrics`),

  code: {
    files: (owner: string, repo: string, path = "", ref = "main") =>
      get<TFileEntry[] | { content: string; name: string }>(
        `/repos/${owner}/${repo}/contents/${path}?ref=${ref}`,
      ),
    branches: (owner: string, repo: string) =>
      get<TBranch[]>(`/repos/${owner}/${repo}/branches`),
    commits: (owner: string, repo: string, ref = "main", limit = 20) =>
      get<TCommit[]>(`/repos/${owner}/${repo}/commits?ref=${ref}&limit=${limit}`),
  },
}
