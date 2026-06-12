import { useState } from "react"

import { EmptyState } from "../../components/shared/EmptyState"
import { SourceBadge } from "../../components/shared/SourceBadge"
import { StatusDot } from "../../components/shared/StatusDot"

type TStepResult = {
  name: string
  status: "passed" | "failed" | "skipped" | "running"
  durationMs: number
  source: "repo" | "policy" | "template"
  policyName?: string
  error?: string
}

type TPipelineRun = {
  id: string
  sha: string
  message: string
  author: string
  branch: string
  status: "passed" | "failed" | "running"
  durationMs: number
  timestamp: string
  steps: TStepResult[]
  policyCount: number
}

const mockRuns: TPipelineRun[] = [
  {
    id: "run-1",
    sha: "08f364d",
    message: "feat: add auth middleware",
    author: "malin",
    branch: "main",
    status: "passed",
    durationMs: 134000,
    timestamp: "2026-06-12T14:30:00Z",
    policyCount: 2,
    steps: [
      { name: "audit", status: "passed", durationMs: 3000, source: "policy", policyName: "security-baseline" },
      { name: "lint", status: "passed", durationMs: 2000, source: "repo" },
      { name: "test", status: "passed", durationMs: 12000, source: "repo" },
      { name: "build", status: "passed", durationMs: 8000, source: "repo" },
      { name: "trivy", status: "passed", durationMs: 5000, source: "policy", policyName: "security-baseline" },
    ],
  },
  {
    id: "run-2",
    sha: "f81c734",
    message: "fix: validate input on login",
    author: "erik",
    branch: "main",
    status: "failed",
    durationMs: 18000,
    timestamp: "2026-06-12T13:15:00Z",
    policyCount: 2,
    steps: [
      { name: "audit", status: "passed", durationMs: 3000, source: "policy", policyName: "security-baseline" },
      { name: "lint", status: "passed", durationMs: 2000, source: "repo" },
      { name: "test", status: "failed", durationMs: 4000, source: "repo", error: "src/auth/validate.test.ts:42\nexpected 401, got 500" },
      { name: "build", status: "skipped", durationMs: 0, source: "repo" },
      { name: "trivy", status: "skipped", durationMs: 0, source: "policy", policyName: "security-baseline" },
    ],
  },
]

export function PipelinesTab() {
  const [runs] = useState<TPipelineRun[]>(mockRuns)
  const [expandedRun, setExpandedRun] = useState<string | null>(null)

  if (runs.length === 0) {
    return (
      <EmptyState
        title="No pipeline runs yet."
        description="Pipelines run automatically when you push to a gated branch."
        command="Configure steps in .gittan.yaml"
      />
    )
  }

  return (
    <div className="space-y-1.5">
      {runs.map((run) => {
        const isExpanded = expandedRun === run.id
        return (
          <div key={run.id} className="bg-surface-900 border border-surface-800 rounded-md overflow-hidden">
            <button
              onClick={() => setExpandedRun(isExpanded ? null : run.id)}
              className="w-full text-left px-4 py-3 hover:bg-surface-800/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <StatusDot status={run.status === "running" ? "running" : run.status === "passed" ? "passed" : "failed"} />
                  <span className="text-xs text-surface-600 font-mono">{run.sha}</span>
                  <span className="text-sm text-surface-300 truncate">{run.message}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-surface-500">{run.author}</span>
                  <span className="text-xs text-surface-600">{timeAgo(run.timestamp)}</span>
                  <span className="text-xs text-surface-500">{formatMs(run.durationMs)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1.5 ml-5">
                <span className="text-[10px] text-surface-600">{run.branch}</span>
                <span className="text-[10px] text-surface-700">·</span>
                <span className="text-[10px] text-surface-600">{run.steps.length} steps</span>
                {run.policyCount > 0 && (
                  <>
                    <span className="text-[10px] text-surface-700">·</span>
                    <span className="text-[10px] text-indigo-400">{run.policyCount} policy</span>
                  </>
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-surface-800 px-4 py-3">
                <div className="space-y-1">
                  {run.steps.map((step) => (
                    <StepRow key={step.name} step={step} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function StepRow({ step }: { step: TStepResult }) {
  const [showError, setShowError] = useState(false)
  const statusIcon = {
    passed: "✓",
    failed: "✗",
    skipped: "⊘",
    running: "⟳",
  }[step.status]

  const statusColor = {
    passed: "text-emerald-400",
    failed: "text-red-400",
    skipped: "text-surface-600",
    running: "text-yellow-400",
  }[step.status]

  return (
    <div>
      <div
        className={`flex items-center gap-3 px-3 py-1.5 rounded ${step.error ? "cursor-pointer hover:bg-surface-800/30" : ""}`}
        onClick={() => step.error && setShowError(!showError)}
      >
        <span className={`text-sm ${statusColor} w-4 text-center`}>{statusIcon}</span>
        <SourceBadge source={step.source} name={step.policyName} />
        <span className={`text-sm ${step.status === "skipped" ? "text-surface-600" : "text-surface-300"}`}>
          {step.name}
        </span>
        <span className="text-xs text-surface-600 ml-auto">
          {step.durationMs > 0 ? formatMs(step.durationMs) : ""}
        </span>
      </div>
      {showError && step.error && (
        <div className="ml-10 px-3 py-2 mb-1 bg-red-400/5 border border-red-400/20 rounded text-xs text-red-300 font-mono whitespace-pre">
          {step.error}
        </div>
      )}
    </div>
  )
}

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
  const m = Math.floor(s / 60)
  const rs = s % 60
  return rs > 0 ? `${m}m ${rs}s` : `${m}m`
}
