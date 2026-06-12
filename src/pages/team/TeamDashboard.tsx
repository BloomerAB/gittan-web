import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { api, type TRepo, type TRepoActivity, type TTeam, type TTeamMetrics } from "../../api"
import { EmptyState } from "../../components/shared/EmptyState"
import { MetricCard } from "../../components/shared/MetricCard"
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">{team.displayName}</h2>
          {team.slackChannel && (
            <p className="text-[11px] text-surface-600 mt-0.5">{team.slackChannel}</p>
          )}
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
          {metrics && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <MetricCard
                label="Push frequency"
                value={metrics.pushFrequency > 0 ? `${metrics.pushFrequency}/day` : "—"}
                description="Pushes to main per day"
                color={metrics.pushFrequency >= 3 ? "emerald" : metrics.pushFrequency >= 1 ? "yellow" : "zinc"}
              />
              <MetricCard
                label="Pipeline lead time"
                value={metrics.avgPipelineLeadTimeMs > 0 ? formatMs(metrics.avgPipelineLeadTimeMs) : "—"}
                description="Push to pipeline passed"
                color={metrics.avgPipelineLeadTimeMs > 0 && metrics.avgPipelineLeadTimeMs < 300000 ? "emerald" : "zinc"}
              />
              <MetricCard
                label="Rejection rate"
                value={metrics.totalPushes > 0 ? `${Math.round(metrics.pushRejectionRate * 100)}%` : "—"}
                description="Failed gated pushes"
                color={metrics.pushRejectionRate < 0.1 ? "emerald" : metrics.pushRejectionRate < 0.3 ? "yellow" : "red"}
              />
              <MetricCard
                label="Recovery time"
                value={metrics.avgRecoveryTimeMs > 0 ? formatMs(metrics.avgRecoveryTimeMs) : "—"}
                description="Failure to next success"
                color={metrics.avgRecoveryTimeMs > 0 && metrics.avgRecoveryTimeMs < 1800000 ? "emerald" : "zinc"}
              />
            </div>
          )}

          <div className="space-y-2">
            {repos.length === 0 ? (
              <EmptyState
                title="No repositories yet."
                command={`gittan repos create <name> --team ${teamName}`}
              />
            ) : (
              repos.map((repo) => (
                <Link
                  key={repo.id}
                  to={`/${teamName}/${repo.name}`}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-surface-900 border border-surface-800 hover:border-surface-600 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusDot status="idle" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{repo.name}</p>
                      {activity[repo.id]?.lastCommit ? (
                        <p className="text-xs text-surface-500 truncate max-w-md">
                          <span className="text-surface-600 font-mono">
                            {activity[repo.id].lastCommit!.sha.slice(0, 7)}
                          </span>{" "}
                          {activity[repo.id].lastCommit!.message.slice(0, 60)}{" "}
                          <span className="text-surface-600">
                            · {activity[repo.id].lastCommit!.author} · {timeAgo(activity[repo.id].lastCommit!.timestamp)}
                          </span>
                        </p>
                      ) : (
                        <p className="text-xs text-surface-600">main</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {repo.gatedBranches.includes("main") && (
                      <span className="text-[11px] bg-surface-800 text-surface-400 px-2 py-0.5 rounded">
                        gated
                      </span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
