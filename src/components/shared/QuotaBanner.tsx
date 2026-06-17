import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { api, type TOrgUsage } from "../../api"

type QuotaState = "ok" | "warning" | "blocked"

const WARN_THRESHOLD = 0.9

function getQuotaState(usage: TOrgUsage): QuotaState {
  if (usage.ciMinutesLimit === 0) return "ok"
  if (usage.ciMinutesUsed >= usage.ciMinutesLimit) return "blocked"
  if (usage.ciMinutesUsed >= usage.ciMinutesLimit * WARN_THRESHOLD) return "warning"
  return "ok"
}

export function QuotaBanner({ orgId }: { orgId: string }) {
  const [usage, setUsage] = useState<TOrgUsage | null>(null)

  useEffect(() => {
    api.usage(orgId).then(setUsage).catch(() => {})
  }, [orgId])

  if (!usage) return null

  const state = getQuotaState(usage)
  if (state === "ok") return null

  const pct = Math.round((usage.ciMinutesUsed / usage.ciMinutesLimit) * 100)

  if (state === "blocked") {
    return (
      <div className="bg-red-900/80 border-b border-red-700 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-red-200 font-semibold text-sm">
            CI pipelines blocked
          </span>
          <span className="text-red-300/80 text-sm">
            {usage.ciMinutesUsed.toLocaleString()} / {usage.ciMinutesLimit.toLocaleString()} minutes used ({pct}%)
          </span>
        </div>
        <Link
          to="/admin/subscription"
          className="text-sm bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
        >
          Upgrade plan
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-amber-900/60 border-b border-amber-700/50 px-6 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-amber-200 font-medium text-sm">
          CI minutes running low
        </span>
        <span className="text-amber-300/70 text-sm">
          {usage.ciMinutesUsed.toLocaleString()} / {usage.ciMinutesLimit.toLocaleString()} minutes used ({pct}%)
        </span>
      </div>
      <Link
        to="/admin/subscription"
        className="text-sm text-amber-300 hover:text-amber-200 transition-colors"
      >
        View usage
      </Link>
    </div>
  )
}
