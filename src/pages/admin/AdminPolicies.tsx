import { EmptyState } from "../../components/shared/EmptyState"

export function AdminPolicies() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Org Policies</h2>
        <button className="text-sm bg-accent-600 hover:bg-accent-500 text-white px-4 py-2 rounded-md transition-colors">
          Create policy
        </button>
      </div>

      <p className="text-sm text-surface-500 mb-6">
        Policies inject pipeline steps into matching repos automatically.
        Teams cannot remove policy-injected steps.
      </p>

      <EmptyState
        title="No policies configured."
        description="Create a policy to inject security scanning, linting, or other steps into matching repos."
      />
    </div>
  )
}
