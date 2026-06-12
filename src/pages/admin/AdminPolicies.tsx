import { useState } from "react"

import { EmptyState } from "../../components/shared/EmptyState"

type TPolicy = {
  name: string
  description: string
  enabled: boolean
  match: { files?: string[]; team?: string; name?: string }
  injectBefore: Array<{ name: string; use: string }>
  injectAfter: Array<{ name: string; use: string }>
}

const mockPolicies: TPolicy[] = []

export function AdminPolicies() {
  const [policies] = useState<TPolicy[]>(mockPolicies)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Org Policies</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-sm bg-accent-600 hover:bg-accent-500 text-white px-4 py-2 rounded-md transition-colors"
        >
          Create policy
        </button>
      </div>

      <p className="text-sm text-surface-500 mb-6">
        Policies inject pipeline steps into matching repos automatically.
        Teams cannot remove policy-injected steps.
      </p>

      {showCreate && <PolicyForm onClose={() => setShowCreate(false)} />}

      {policies.length === 0 && !showCreate ? (
        <EmptyState
          title="No policies configured."
          description="Create a policy to inject security scanning, linting, or other steps into matching repos."
        />
      ) : (
        <div className="space-y-2">
          {policies.map((policy) => (
            <div
              key={policy.name}
              className="bg-surface-900 border border-surface-800 rounded-md px-4 py-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-white font-medium">{policy.name}</span>
                  {!policy.enabled && (
                    <span className="text-[10px] text-surface-600 border border-surface-800 px-1.5 py-0.5 rounded ml-2">
                      disabled
                    </span>
                  )}
                </div>
                <span className="text-xs text-surface-600">
                  {policy.injectBefore.length + policy.injectAfter.length} steps
                </span>
              </div>
              {policy.description && (
                <p className="text-xs text-surface-500 mt-1">{policy.description}</p>
              )}
              <div className="flex gap-2 mt-2">
                {policy.match.files?.map((f) => (
                  <span key={f} className="text-[10px] bg-surface-800 text-surface-400 px-1.5 py-0.5 rounded font-mono">
                    file: {f}
                  </span>
                ))}
                {policy.match.team && (
                  <span className="text-[10px] bg-surface-800 text-surface-400 px-1.5 py-0.5 rounded">
                    team: {policy.match.team}
                  </span>
                )}
                {policy.match.name && (
                  <span className="text-[10px] bg-surface-800 text-surface-400 px-1.5 py-0.5 rounded font-mono">
                    name: {policy.match.name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PolicyForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-surface-900 border border-surface-800 rounded-md p-5 mb-6 max-w-xl">
      <h3 className="text-sm font-medium text-white mb-4">New policy</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-surface-600 mb-1">Name</label>
          <input
            type="text"
            placeholder="security-baseline"
            className="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none font-mono"
          />
        </div>

        <div>
          <label className="block text-xs text-surface-600 mb-1">Description</label>
          <input
            type="text"
            placeholder="Security scanning for all Node.js repos"
            className="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-surface-600 mb-2">Match criteria</label>
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <span className="text-xs text-surface-500 w-16">Files</span>
              <input
                type="text"
                placeholder="package.json, Dockerfile"
                className="flex-1 bg-surface-950 border border-surface-800 rounded-md px-3 py-1.5 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none font-mono"
              />
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-surface-500 w-16">Team</span>
              <input
                type="text"
                placeholder="platform (optional)"
                className="flex-1 bg-surface-950 border border-surface-800 rounded-md px-3 py-1.5 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-surface-500 w-16">Name</span>
              <input
                type="text"
                placeholder="api-* (glob pattern, optional)"
                className="flex-1 bg-surface-950 border border-surface-800 rounded-md px-3 py-1.5 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs text-surface-600 mb-2">Inject steps</label>
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <span className="text-[10px] text-surface-600 bg-surface-800 px-1.5 py-0.5 rounded w-12 text-center">before</span>
              <input
                type="text"
                placeholder="step name"
                className="w-28 bg-surface-950 border border-surface-800 rounded-md px-2 py-1.5 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none font-mono"
              />
              <input
                type="text"
                placeholder="use: platform/npm-audit"
                className="flex-1 bg-surface-950 border border-surface-800 rounded-md px-2 py-1.5 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none font-mono"
              />
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-[10px] text-surface-600 bg-surface-800 px-1.5 py-0.5 rounded w-12 text-center">after</span>
              <input
                type="text"
                placeholder="step name"
                className="w-28 bg-surface-950 border border-surface-800 rounded-md px-2 py-1.5 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none font-mono"
              />
              <input
                type="text"
                placeholder="use: platform/trivy"
                className="flex-1 bg-surface-950 border border-surface-800 rounded-md px-2 py-1.5 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button className="text-sm bg-accent-600 hover:bg-accent-500 text-white px-4 py-2 rounded-md transition-colors">
            Create policy
          </button>
          <button
            onClick={onClose}
            className="text-sm text-surface-500 hover:text-surface-300 px-4 py-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
