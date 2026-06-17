import { useEffect, useState } from "react"

import { api, type TPlatformUsage, type TPlatformOrgUsage } from "../../api"

export function AdminUsage() {
  const [data, setData] = useState<TPlatformUsage | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.platformUsage()
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Platform Usage</h2>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Platform Usage</h2>
        <div className="w-5 h-5 border-2 border-surface-700 border-t-surface-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Platform Usage</h2>

      <div className="grid grid-cols-5 gap-4 mb-8">
        <SummaryCard label="Organizations" value={data.summary.totalOrgs} />
        <SummaryCard
          label="Monthly revenue"
          value={`€${data.summary.totalRevenue.toLocaleString()}`}
        />
        <SummaryCard
          label="CI minutes used"
          value={data.summary.totalCiMinutes.toLocaleString()}
        />
        <SummaryCard
          label="Blocked"
          value={data.summary.blocked}
          variant={data.summary.blocked > 0 ? "danger" : "default"}
        />
        <SummaryCard
          label="Warning"
          value={data.summary.warning}
          variant={data.summary.warning > 0 ? "warning" : "default"}
        />
      </div>

      <div className="bg-surface-900 border border-surface-800 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-800 text-surface-500 text-left">
              <th className="px-4 py-3 font-medium">Organization</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">CI minutes</th>
              <th className="px-4 py-3 font-medium">Quota</th>
              <th className="px-4 py-3 font-medium text-right">Storage</th>
              <th className="px-4 py-3 font-medium text-right">Users</th>
              <th className="px-4 py-3 font-medium text-right">Teams</th>
              <th className="px-4 py-3 font-medium text-right">Repos</th>
              <th className="px-4 py-3 font-medium text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.orgs.map((org) => (
              <OrgRow key={org.orgId} org={org} />
            ))}
            {data.orgs.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-surface-600">
                  No organizations yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  variant = "default",
}: {
  label: string
  value: string | number
  variant?: "default" | "danger" | "warning"
}) {
  const valueColor =
    variant === "danger"
      ? "text-red-400"
      : variant === "warning"
        ? "text-amber-400"
        : "text-white"

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-md p-4">
      <p className="text-xs text-surface-500 mb-1">{label}</p>
      <p className={`text-xl font-semibold ${valueColor}`}>{value}</p>
    </div>
  )
}

function OrgRow({ org }: { org: TPlatformOrgUsage }) {
  const pct = org.ciMinutesLimit > 0
    ? Math.round((org.ciMinutesUsed / org.ciMinutesLimit) * 100)
    : 0

  const storageMb = Math.round(org.storageBytes / 1_000_000)
  const storageDisplay = storageMb >= 1000
    ? `${(storageMb / 1000).toFixed(1)} GB`
    : `${storageMb} MB`

  return (
    <tr className="border-b border-surface-800/50 hover:bg-surface-800/30 transition-colors">
      <td className="px-4 py-3 text-white font-medium">{org.orgId}</td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded ${
          org.plan === "team"
            ? "bg-accent-900/40 text-accent-300 border border-accent-800/50"
            : "bg-surface-800 text-surface-400 border border-surface-700"
        }`}>
          {org.plan}
          {org.ciBlocks > 0 && ` +${org.ciBlocks} block${org.ciBlocks > 1 ? "s" : ""}`}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-surface-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                org.quotaStatus === "blocked"
                  ? "bg-red-400"
                  : org.quotaStatus === "warning"
                    ? "bg-amber-400"
                    : "bg-accent-400"
              }`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <span className="text-surface-400 text-xs whitespace-nowrap">
            {org.ciMinutesUsed.toLocaleString()} / {org.ciMinutesLimit.toLocaleString()}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <QuotaBadge status={org.quotaStatus} />
      </td>
      <td className="px-4 py-3 text-right text-surface-400">{storageDisplay}</td>
      <td className="px-4 py-3 text-right text-surface-400">{org.userCount}</td>
      <td className="px-4 py-3 text-right text-surface-400">{org.teamCount}</td>
      <td className="px-4 py-3 text-right text-surface-400">{org.repoCount}</td>
      <td className="px-4 py-3 text-right text-white font-medium">€{org.monthlyRevenue}</td>
    </tr>
  )
}

function QuotaBadge({ status }: { status: "ok" | "warning" | "blocked" }) {
  if (status === "blocked") {
    return (
      <span className="text-xs px-2 py-0.5 rounded bg-red-900/50 text-red-300 border border-red-800/50">
        blocked
      </span>
    )
  }

  if (status === "warning") {
    return (
      <span className="text-xs px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-800/50">
        warning
      </span>
    )
  }

  return (
    <span className="text-xs px-2 py-0.5 rounded bg-emerald-900/30 text-emerald-400 border border-emerald-800/40">
      ok
    </span>
  )
}
