<script lang="ts">
  import EmptyState from '$lib/components/EmptyState.svelte'

  let { data }: { data: any } = $props()

  let repo = $derived(data.repo)

  type DepType = 'cascade' | 'contract-test' | 'manual'

  type Dep = {
    repoName: string
    teamName: string
    types: DepType[]
  }

  const badgeStyles: Record<DepType, string> = {
    cascade: 'text-accent-400 bg-accent-400/10',
    'contract-test': 'text-ok-400 bg-ok-400/10',
    manual: 'text-surface-400 bg-surface-800',
  }

  const mockDeps: Record<string, { dependencies: Dep[]; dependents: Dep[] }> = {
    'gittan-api': {
      dependencies: [
        { repoName: 'gittan-types', teamName: 'platform', types: ['cascade'] },
      ],
      dependents: [
        { repoName: 'gittan-web', teamName: 'platform', types: ['cascade', 'contract-test'] },
        { repoName: 'gittan-cli', teamName: 'platform', types: ['cascade'] },
      ],
    },
    'gittan-types': {
      dependencies: [],
      dependents: [
        { repoName: 'gittan-api', teamName: 'platform', types: ['cascade'] },
        { repoName: 'gittan-runner', teamName: 'platform', types: ['cascade'] },
        { repoName: 'gittan-cli', teamName: 'platform', types: ['cascade'] },
      ],
    },
    'gittan-web': {
      dependencies: [
        { repoName: 'gittan-api', teamName: 'platform', types: ['cascade', 'contract-test'] },
        { repoName: 'gittan-types', teamName: 'platform', types: ['cascade'] },
      ],
      dependents: [],
    },
  }

  let depData = $derived(mockDeps[repo.name] ?? { dependencies: [], dependents: [] })
  let hasDeps = $derived(depData.dependencies.length > 0 || depData.dependents.length > 0)
</script>

<div>
  {#if !hasDeps}
    <EmptyState
      title="No dependencies configured"
      description="Define dependencies in your .gittan.yml to enable cascade pipelines."
    />
  {:else}
    {#if depData.dependencies.length > 0}
      <div class="mb-6">
        <h3 class="text-xs uppercase text-surface-500 tracking-wider mb-3">
          Dependencies
          <span class="text-surface-600 normal-case tracking-normal ml-1">-- what this repo needs</span>
        </h3>
        <div class="space-y-2">
          {#each depData.dependencies as dep}
            <div class="flex items-center gap-3 px-4 py-3 bg-surface-900 border border-surface-800 rounded-lg">
              <span class="text-accent-400 text-sm">&rarr;</span>
              <span class="text-sm text-white font-medium">{dep.repoName}</span>
              <span class="text-xs text-surface-600">{dep.teamName}</span>
              <div class="flex-1"></div>
              {#each dep.types as depType}
                <span class="text-[10px] px-1.5 py-0.5 rounded {badgeStyles[depType]}">{depType}</span>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if depData.dependents.length > 0}
      <div class="mb-6">
        <h3 class="text-xs uppercase text-surface-500 tracking-wider mb-3">
          Dependents
          <span class="text-surface-600 normal-case tracking-normal ml-1">-- what breaks if this repo breaks</span>
        </h3>
        <div class="space-y-2">
          {#each depData.dependents as dep}
            <div class="flex items-center gap-3 px-4 py-3 bg-surface-900 border border-surface-800 rounded-lg">
              <span class="text-err-400 text-sm">&larr;</span>
              <span class="text-sm text-white font-medium">{dep.repoName}</span>
              <span class="text-xs text-surface-600">{dep.teamName}</span>
              <div class="flex-1"></div>
              {#each dep.types as depType}
                <span class="text-[10px] px-1.5 py-0.5 rounded {badgeStyles[depType]}">{depType}</span>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <div class="bg-surface-900 border border-surface-800 rounded-lg p-4 mt-6">
      <h4 class="text-xs text-surface-400 font-medium mb-2">How dependencies work</h4>
      <div class="space-y-2 text-xs text-surface-600">
        <p>
          <span class="text-accent-400 font-medium">cascade</span> --
          A successful push to a dependency triggers the pipeline of all dependents.
          If the upstream repo passes, downstream repos are re-verified automatically.
        </p>
        <p>
          <span class="text-ok-400 font-medium">contract-test</span> --
          Contract tests run between the dependency and dependent to verify API compatibility.
          Both repos must define matching contract test steps.
        </p>
        <p>
          <span class="text-surface-400 font-medium">manual</span> --
          Dependency is tracked for visibility but does not trigger automatic pipelines.
          Teams are notified of upstream changes via Slack.
        </p>
      </div>
    </div>
  {/if}
</div>
