import { useOutletContext } from "react-router-dom"

import type { TRepo, TTeam } from "../../api"

type TContext = { repo: TRepo; team: TTeam }

export function SettingsTab() {
  const { repo, team } = useOutletContext<TContext>()

  return (
    <div className="space-y-8 max-w-lg">
      <section>
        <h3 className="text-sm font-medium text-white mb-2">Gated branches</h3>
        <p className="text-xs text-surface-600 mb-3">
          Pushes to these branches run the full pipeline before landing.
        </p>
        <div className="flex gap-2">
          {repo.gatedBranches.map((b) => (
            <span key={b} className="text-sm bg-surface-800 text-surface-300 px-3 py-1 rounded">
              {b}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-white mb-2">Clone</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-surface-600 w-10">SSH</span>
            <code className="text-xs text-surface-400 bg-surface-900 border border-surface-800 px-3 py-1.5 rounded font-mono flex-1">
              {repo.forgejoFullName ? `git@gittan.eu:${repo.forgejoFullName}.git` : "—"}
            </code>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-white mb-2">Team</h3>
        <p className="text-sm text-surface-400">{team.displayName}</p>
        <p className="text-xs text-surface-600 mt-1">
          Change team ownership via CLI: <code className="text-surface-500">gittan repos move</code>
        </p>
      </section>
    </div>
  )
}
