<script lang="ts">
  import EmptyState from '$lib/components/EmptyState.svelte'

  let { data } = $props()
</script>

<EmptyState
  title="Team Pipelines"
  description="Aggregated pipeline runs across all repos in this team will appear here."
/>
