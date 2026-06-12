import { EmptyState } from "../../components/shared/EmptyState"

export function DependenciesTab() {
  return (
    <EmptyState
      title="No dependencies configured."
      description="Add cross-repo dependencies to trigger cascade pipelines."
      command="depends:\n  - repo: shared-types\n    cascade: true"
    />
  )
}
