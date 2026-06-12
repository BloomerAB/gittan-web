import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { api, type TRepo, type TRepoActivity, type TTeam, type TTeamMetrics } from "../../api"
import { EmptyState } from "../../components/shared/EmptyState"
import { SkeletonMetrics, SkeletonRow } from "../../components/shared/Skeleton"
import { StatusDot } from "../../components/shared/StatusDot"

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m`
}

export function TeamDashboard({
  teams,
  reposByTeam,
}: {
  teams: TTeam[]
  reposByTeam: Record<string, TRepo[]>
}) {
  const { teamName } = useParams()
  const team = teams.find((t) => t.name === teamName)
  const [activity, setActivity] = useState<Record<string, TRepoActivity>>({})
  const [metrics, setMetrics] = useState<TTeamMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!team) return
    setLoading(true)

    Promise.all([
      api.activity(team.id).then((acts) => {
        const map: Record<string, TRepoActivity> = {}
        for (const a of acts) map[a.repoId] = a
        setActivity(map)
      }),
      api.metrics(team.id).then(setMetrics),
    ])
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [team?.id])

  if (!team) return <EmptyState title="Team not found." />

  const repos = reposByTeam[team.id] ?? []
  const reposWithActivity = repos.map((repo) => ({
    ...repo,
    activity: activity[repo.id],
  }))

  const activeRepos = reposWithActivity.filter((r) => r.activity?.lastCommit)
  const idleRepos = reposWithActivity.filter((r) => !r.activity?.lastCommit)

  return (
    <div className="p-6">
      {/* Team header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold text-white">{team.displayName}</h2>
          {team.slackChannel && (
            <p className="text-[11px] text-surface-600 mt-0.5">{team.slackChannel}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-white">{repos.length}</p>
          <p className="text-[11px] text-surface-600">repositories</p>
        </div>
      </div>

      {loading ? (
        <>
          <SkeletonMetrics />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        </>
      ) : (
        <>
          {/* Team health — DORA + status combined */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            <HealthCard
              label="REPOS"
              value={`${repos.length}`}
              detail={`${activeRepos.length} active`}
              status="neutral"
            />
            <HealthCard
              label="PUSH FREQ"
              value={metrics && metrics.pushFrequency > 0 ? `${metrics.pushFrequency}/d` : "—"}
              detail="pushes to main"
              status={
                !metrics || metrics.pushFrequency === 0 ? "neutral"
                  : metrics.pushFrequency >= 3 ? "good"
                  : metrics.pushFrequency >= 1 ? "warn" : "neutral"
              }
            />
            <HealthCard
              label="LEAD TIME"
              value={metrics && metrics.avgPipelineLeadTimeMs > 0 ? formatMs(metrics.avgPipelineLeadTimeMs) : "—"}
              detail="push → deployed"
              status={
                !metrics || metrics.avgPipelineLeadTimeMs === 0 ? "neutral"
                  : metrics.avgPipelineLeadTimeMs < 300000 ? "good"
                  : metrics.avgPipelineLeadTimeMs < 600000 ? "warn" : "bad"
              }
            />
            <HealthCard
              label="REJECTION"
              value={metrics && metrics.totalPushes > 0 ? `${Math.round(metrics.pushRejectionRate * 100)}%` : "—"}
              detail="failed pushes"
              status={
                !metrics || metrics.totalPushes === 0 ? "neutral"
                  : metrics.pushRejectionRate < 0.1 ? "good"
                  : metrics.pushRejectionRate < 0.3 ? "warn" : "bad"
              }
            />
            <HealthCard
              label="RECOVERY"
              value={metrics && metrics.avgRecoveryTimeMs > 0 ? formatMs(metrics.avgRecoveryTimeMs) : "—"}
              detail="failure → fix"
              status={
                !metrics || metrics.avgRecoveryTimeMs === 0 ? "neutral"
                  : metrics.avgRecoveryTimeMs < 1800000 ? "good"
                  : metrics.avgRecoveryTimeMs < 3600000 ? "warn" : "bad"
              }
            />
          </div>

          {/* Repos */}
          {repos.length === 0 ? (
            <EmptyState
              title="No repositories yet."
              command={`gittan repos create <name> --team ${teamName}`}
            />
          ) : (
            <div>
              {/* Section: active repos (have recent commits) */}
              {activeRepos.length > 0 && (
                <div className="mb-4">
                  <div className="space-y-1.5">
                    {activeRepos.map((repo) => (
                      <RepoRow key={repo.id} repo={repo} teamName={teamName!} />
                    ))}
                  </div>
                </div>
              )}

              {/* Section: idle repos */}
              {idleRepos.length > 0 && (
                <div>
                  {activeRepos.length > 0 && (
                    <p className="text-[11px] text-surface-600 uppercase tracking-wider mb-2 mt-4">
                      No recent activity
                    </p>
                  )}
                  <div className="space-y-1.5">
                    {idleRepos.map((repo) => (
                      <RepoRow key={repo.id} repo={repo} teamName={teamName!} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function HealthCard({
  label,
  value,
  detail,
  status,
}: {
  label: string
  value: string
  detail: string
  status: "good" | "warn" | "bad" | "neutral"
}) {
  const borderColor = {
    good: "border-emerald-400/30",
    warn: "border-yellow-400/30",
    bad: "border-red-400/30",
    neutral: "border-surface-800",
  }[status]

  const valueColor = {
    good: "text-emerald-400",
    warn: "text-yellow-400",
    bad: "text-red-400",
    neutral: "text-surface-400",
  }[status]

  return (
    <div className={`bg-surface-900 border ${borderColor} rounded-md px-3 py-3`}>
      <p className="text-[10px] text-surface-600 uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-semibold mt-1 ${valueColor}`}>{value}</p>
      <p className="text-[10px] text-surface-700 mt-0.5">{detail}</p>
    </div>
  )
}

function RepoRow({
  repo,
  teamName,
}: {
  repo: TRepo & { activity?: TRepoActivity }
  teamName: string
}) {
  const commit = repo.activity?.lastCommit
  const hasActivity = !!commit

  return (
    <Link
      to={`/${teamName}/${repo.name}`}
      className="flex items-center justify-between px-4 py-2.5 rounded-md bg-surface-900 border border-surface-800 hover:border-surface-600 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <StatusDot status={hasActivity ? "idle" : "pending"} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">{repo.name}</p>
          {commit ? (
            <p className="text-xs text-surface-500 truncate max-w-lg">
              <span className="text-surface-600 font-mono">{commit.sha.slice(0, 7)}</span>
              {" "}{commit.message.slice(0, 50)}
              <span className="text-surface-700"> · {commit.author} · {timeAgo(commit.timestamp)}</span>
            </p>
          ) : (
            <p className="text-xs text-surface-700">no activity</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {repo.gatedBranches.includes("main") && (
          <span className="text-[10px] text-surface-600 border border-surface-800 px-1.5 py-0.5 rounded">
            gated
          </span>
        )}
      </div>
    </Link>
  )
}
