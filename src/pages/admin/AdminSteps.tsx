import { EmptyState } from "../../components/shared/EmptyState"

export function AdminSteps() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Step Registry</h2>
        <button className="text-sm bg-accent-600 hover:bg-accent-500 text-white px-4 py-2 rounded-md transition-colors">
          Register step
        </button>
      </div>

      <p className="text-sm text-surface-500 mb-6">
        Reusable step definitions that teams reference with <code className="text-surface-400 bg-surface-800 px-1 rounded text-xs">use:</code> in their .gittan.yaml.
        Steps are container images with template variables.
      </p>

      <EmptyState
        title="No steps registered."
        description="Register reusable steps like security scanners, linters, or deploy tools."
        command="gittan admin steps register node/test --image node:\${node-version}-slim --run 'npm test'"
      />
    </div>
  )
}
