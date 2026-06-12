import { useOutletContext } from "react-router-dom"

import type { TRepo, TTeam } from "../../api"
import { EmptyState } from "../../components/shared/EmptyState"

type TContext = { repo: TRepo; team: TTeam }

type TDep = {
  repoName: string
  teamName: string
  cascade: boolean
  contractTest: boolean
}

const mockDependencies: Record<string, TDep[]> = {
  "gittan-api": [
    { repoName: "gittan-types", teamName: "platform", cascade: true, contractTest: true },
  ],
  "gittan-runner": [
    { repoName: "gittan-types", teamName: "platform", cascade: true, contractTest: false },
  ],
  "api-gateway": [
    { repoName: "gittan-types", teamName: "platform", cascade: true, contractTest: true },
    { repoName: "api-users", teamName: "api", cascade: false, contractTest: false },
  ],
}

const mockDependents: Record<string, TDep[]> = {
  "gittan-types": [
    { repoName: "gittan-api", teamName: "platform", cascade: true, contractTest: true },
    { repoName: "gittan-runner", teamName: "platform", cascade: true, contractTest: false },
    { repoName: "api-gateway", teamName: "api", cascade: true, contractTest: true },
  ],
}

export function DependenciesTab() {
  const { repo } = useOutletContext<TContext>()

  const deps = mockDependencies[repo.name] ?? []
  const dependents = mockDependents[repo.name] ?? []
  const hasDeps = deps.length > 0 || dependents.length > 0

  if (!hasDeps) {
    return (
      <EmptyState
        title="No dependencies configured."
        description="Add cross-repo dependencies to trigger cascade pipelines."
        command={"depends:\n  - repo: shared-types\n    cascade: true"}
      />
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Dependencies — what this repo depends on */}
      <section>
        <h3 className="text-sm font-medium text-white mb-1 flex items-center gap-2">
          Dependencies
          <span className="text-xs text-surface-600 font-normal">what this repo needs</span>
        </h3>
        {deps.length === 0 ? (
          <p className="text-xs text-surface-600 mt-2">No dependencies.</p>
        ) : (
          <div className="mt-3 space-y-1.5">
            {deps.map((dep) => (
              <DepRow key={dep.repoName} dep={dep} direction="depends-on" />
            ))}
          </div>
        )}
      </section>

      {/* Dependents — what depends on this repo */}
      <section>
        <h3 className="text-sm font-medium text-white mb-1 flex items-center gap-2">
          Dependents
          <span className="text-xs text-surface-600 font-normal">what breaks if this repo breaks</span>
        </h3>
        {dependents.length === 0 ? (
          <p className="text-xs text-surface-600 mt-2">No dependents.</p>
        ) : (
          <div className="mt-3 space-y-1.5">
            {dependents.map((dep) => (
              <DepRow key={dep.repoName} dep={dep} direction="depended-by" />
            ))}
          </div>
        )}
      </section>

      {/* Cascade explanation */}
      <section className="border-t border-surface-800 pt-4">
        <p className="text-xs text-surface-600">
          When a dependency passes its pipeline on main, Gittan automatically triggers
          this repo's pipeline (cascade). Contract testing runs this repo's tests against
          the new dependency version before accepting.
        </p>
      </section>
    </div>
  )
}

function DepRow({
  dep,
  direction,
}: {
  dep: TDep
  direction: "depends-on" | "depended-by"
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-surface-900 border border-surface-800 rounded-md">
      <div className="flex items-center gap-3">
        <span className="text-surface-600 text-xs">
          {direction === "depends-on" ? "→" : "←"}
        </span>
        <div>
          <span className="text-sm text-white font-medium">{dep.repoName}</span>
          <span className="text-xs text-surface-600 ml-2">{dep.teamName}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {dep.cascade && (
          <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
            cascade
          </span>
        )}
        {dep.contractTest && (
          <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
            contract-test
          </span>
        )}
        {!dep.cascade && (
          <span className="text-[10px] text-surface-600 bg-surface-800 px-1.5 py-0.5 rounded">
            manual
          </span>
        )}
      </div>
    </div>
  )
}
