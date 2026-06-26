export type TOrg = {
  id: string
  name: string
  displayName: string
  role: 'owner' | 'admin' | 'member'
  plan: 'starter' | 'team'
  pipelineScope?: 'org' | 'team'
  oidcIssuer?: string
  mandatorySso?: boolean
  ssoEmailDomain?: string
}

export type TTeam = {
  id: string
  orgId: string
  name: string
  displayName: string
  slackChannel?: string
  memberCount?: number
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

export type TTeamMember = {
  userId: string
  email: string | null
  addedAt: string
}

export type TFileEntry = {
  name: string
  path: string
  type: 'file' | 'dir'
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

export type TOrgUsage = {
  orgId: string
  month: string
  ciMinutesUsed: number
  ciMinutesLimit: number
  storageBytes: number
  userCount: number
  teamCount: number
  repoCount: number
}

export type TPlatformOrgUsage = {
  orgId: string
  plan: 'starter' | 'team'
  ciBlocks: number
  ciMinutesUsed: number
  ciMinutesLimit: number
  storageBytes: number
  userCount: number
  teamCount: number
  repoCount: number
  quotaStatus: 'ok' | 'warning' | 'blocked'
  monthlyRevenue: number
}

export type TPlatformUsage = {
  summary: {
    totalOrgs: number
    totalRevenue: number
    totalCiMinutes: number
    blocked: number
    warning: number
  }
  orgs: TPlatformOrgUsage[]
}

export type TOrgPlan = {
  orgId: string
  plan: 'starter' | 'team'
  ciBlocks: number
  ciMinutesLimit: number
  storageLimitGb: number
  userLimit: number
  teamLimit: number
  repoLimit: number
}

export function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rs = s % 60
  return rs > 0 ? `${m}m ${rs}s` : `${m}m`
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
