import { EmptyState } from "../../components/shared/EmptyState"

export function PipelinesTab() {
  return (
    <EmptyState
      title="No pipeline runs yet."
      description="Pipelines run automatically when you push to a gated branch."
      command="Configure steps in .gittan.yaml"
    />
  )
}
