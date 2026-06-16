import { useState } from "react"

import { EmptyState } from "../../components/shared/EmptyState"

type TStep = {
  name: string
  image: string
  run: string
  defaults: Record<string, string>
  cache: string[]
  description: string
}

const exampleSteps: TStep[] = [
  {
    name: "node/test",
    image: "node:${node-version}-slim",
    run: "npm ci && npm test",
    defaults: { "node-version": "22" },
    cache: ["node_modules"],
    description: "Install dependencies and run tests",
  },
  {
    name: "platform/trivy",
    image: "aquasec/trivy:latest",
    run: "trivy fs --severity HIGH,CRITICAL .",
    defaults: {},
    cache: [],
    description: "Security vulnerability scanning",
  },
]

export function AdminSteps() {
  const [steps, setSteps] = useState<TStep[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [, setShowExample] = useState(false)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Step Registry</h2>
        <div className="flex gap-2">
          {steps.length === 0 && (
            <button
              onClick={() => { setSteps(exampleSteps); setShowExample(true) }}
              className="text-sm border border-surface-700 text-surface-400 hover:text-white px-3 py-2 rounded-md transition-colors"
            >
              Load examples
            </button>
          )}
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="text-sm bg-accent-600 hover:bg-accent-500 text-white px-4 py-2 rounded-md transition-colors"
          >
            Register step
          </button>
        </div>
      </div>

      <p className="text-sm text-surface-500 mb-6">
        Reusable step definitions that teams reference with <code className="text-surface-400 bg-surface-800 px-1 rounded text-xs">use:</code> in
        their .gittan.yaml. Steps are container images with template variables.
      </p>

      {showCreate && <StepForm onClose={() => setShowCreate(false)} />}

      {steps.length === 0 && !showCreate ? (
        <EmptyState
          title="No steps registered."
          description="Register reusable steps like security scanners, linters, or deploy tools."
        />
      ) : (
        <div className="space-y-2">
          {steps.map((step) => (
            <div
              key={step.name}
              className="bg-surface-900 border border-surface-800 rounded-md overflow-hidden"
            >
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white font-medium font-mono">{step.name}</span>
                    {step.description && (
                      <span className="text-xs text-surface-500">{step.description}</span>
                    )}
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  <div className="flex gap-2 text-xs">
                    <span className="text-surface-600 w-12">image</span>
                    <code className="text-surface-400 font-mono">{step.image}</code>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="text-surface-600 w-12">run</span>
                    <code className="text-surface-400 font-mono">{step.run}</code>
                  </div>
                  {Object.keys(step.defaults).length > 0 && (
                    <div className="flex gap-2 text-xs">
                      <span className="text-surface-600 w-12">defaults</span>
                      <div className="flex gap-1.5">
                        {Object.entries(step.defaults).map(([k, v]) => (
                          <span key={k} className="bg-surface-800 text-surface-400 px-1.5 py-0.5 rounded font-mono">
                            {k}={v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {step.cache.length > 0 && (
                    <div className="flex gap-2 text-xs">
                      <span className="text-surface-600 w-12">cache</span>
                      <code className="text-surface-400 font-mono">{step.cache.join(", ")}</code>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-surface-800/60">
                  <p className="text-[11px] text-surface-600">
                    Usage: <code className="text-surface-500 font-mono">use: {step.name}</code>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StepForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-surface-900 border border-surface-800 rounded-md p-5 mb-6 max-w-xl">
      <h3 className="text-sm font-medium text-white mb-4">Register step</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-surface-600 mb-1">Name</label>
          <input
            type="text"
            placeholder="platform/trivy"
            className="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none font-mono"
          />
        </div>

        <div>
          <label className="block text-xs text-surface-600 mb-1">Description</label>
          <input
            type="text"
            placeholder="Security vulnerability scanning"
            className="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-surface-600 mb-1">Image</label>
          <input
            type="text"
            placeholder="node:${node-version}-slim"
            className="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none font-mono"
          />
          <p className="text-[10px] text-surface-700 mt-1">Use ${"{variable}"} for template parameters</p>
        </div>

        <div>
          <label className="block text-xs text-surface-600 mb-1">Run command</label>
          <input
            type="text"
            placeholder="npm ci && npm test"
            className="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none font-mono"
          />
        </div>

        <div>
          <label className="block text-xs text-surface-600 mb-1">Default parameters</label>
          <input
            type="text"
            placeholder="node-version=22, timeout=300"
            className="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none font-mono"
          />
        </div>

        <div>
          <label className="block text-xs text-surface-600 mb-1">Cache paths</label>
          <input
            type="text"
            placeholder="node_modules, .npm"
            className="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none font-mono"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button className="text-sm bg-accent-600 hover:bg-accent-500 text-white px-4 py-2 rounded-md transition-colors">
            Register
          </button>
          <button onClick={onClose} className="text-sm text-surface-500 hover:text-surface-300 px-4 py-2 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
