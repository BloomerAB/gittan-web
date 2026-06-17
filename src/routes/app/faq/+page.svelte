<script lang="ts">
  const sections = [
    {
      category: 'Workflow',
      items: [
        {
          q: 'Why no pull requests?',
          a: 'Pull requests solve two problems: code review and gating. Gittan replaces the gating part with a pre-receive hook that runs your pipeline before accepting the push. If the pipeline fails, the push is rejected. Code review happens through pair programming, mob programming, or async review of commits on main. PRs add ceremony that slows teams down without making code better.',
        },
        {
          q: 'Why trunk-based development?',
          a: 'Long-lived branches create integration debt. The longer a branch lives, the harder the merge. Trunk-based development forces small, frequent integrations. Every push is tested against main. Merge conflicts are rare because changes are small. If your change is too big for a single push, use feature flags.',
        },
        {
          q: 'Why terminal feedback?',
          a: 'You just ran git push. You are already in the terminal. Opening a browser to watch CI is a context switch. Gittan streams pipeline output directly to your terminal during push. You see results where you already are. No tabs, no notifications, no polling a web UI.',
        },
      ],
    },
    {
      category: 'Architecture',
      items: [
        {
          q: 'Why micro repos instead of monorepos?',
          a: 'Monorepos need specialized tooling (Bazel, Nx, Turborepo) to avoid rebuilding everything on every change. Micro repos are just git repos. The cascade pipeline system handles cross-repo dependencies: when shared-types passes, downstream repos are automatically tested. You get the dependency safety of a monorepo with the simplicity of separate repos.',
        },
        {
          q: 'Why no Actions marketplace?',
          a: 'GitHub Actions marketplace is a supply chain nightmare. You pull in third-party code that runs with full access to your secrets and source code. One compromised action poisons thousands of repos. Gittan pipelines use container images you control. Pin a specific image tag, scan it, sign it. Your org policy can enforce image sources.',
        },
        {
          q: 'Why no issues, wiki, or project boards?',
          a: 'We do three things: git hosting, pipelines, and team management. Issues belong in a dedicated tracker. Wikis belong in a documentation tool. Project boards belong in a project management tool. Bundling everything into a git host creates a mediocre version of each. Use the best tool for each job.',
        },
      ],
    },
    {
      category: 'Pricing and plans',
      items: [
        {
          q: 'Why no per-seat pricing?',
          a: 'Per-seat pricing punishes collaboration. Need a contractor for two weeks? That costs you a seat. Want a junior to shadow a senior? That costs you a seat. Gittan charges per team, not per person. Add as many people as you need on the Team plan.',
        },
        {
          q: 'Why is OIDC/SSO included on every plan?',
          a: 'Because SSO is a security feature, not a premium add-on. Every other git host charges extra for SSO, which means small teams are forced to use passwords. That is backwards. Every Gittan plan includes OIDC. Connect your identity provider on day one.',
        },
        {
          q: 'Can I self-host Gittan?',
          a: 'No. Gittan is SaaS only. Self-hosting creates a support surface we cannot control and splits focus between product and infrastructure. If you need on-prem git hosting, Forgejo and Gitea are excellent options. We run Forgejo under the hood.',
        },
      ],
    },
    {
      category: 'Metrics and philosophy',
      items: [
        {
          q: 'Why no stars or popularity metrics?',
          a: 'Stars measure marketing, not engineering. A repo with 50,000 stars and 200-second CI is worse than one with zero stars and 8-second CI. Gittan tracks DORA metrics: deployment frequency, lead time for changes, change failure rate, and time to restore. These measure engineering effectiveness, not popularity.',
        },
        {
          q: 'Will you add feature X?',
          a: 'Probably not. Gittan is intentionally limited. Every feature we add is a feature we have to maintain, document, and support. We would rather do three things well than ten things poorly. If the feature you want is covered by a dedicated tool, use that tool instead.',
        },
        {
          q: 'Why are you building this?',
          a: 'Everything available is either too complex (GitLab), too expensive (GitHub Enterprise), too limited (bare Gitea), or too opinionated about workflow (Gerrit). We wanted trunk-based development with gated push, fast pipelines, team-centric permissions, and nothing else. It did not exist, so we built it.',
        },
      ],
    },
  ]
</script>

<div class="max-w-3xl mx-auto px-6 py-12 space-y-12">

  <!-- Header -->
  <section class="space-y-4">
    <h1 class="text-4xl font-bold text-surface-200 tracking-tight">FAQ</h1>
    <p class="text-surface-400 text-lg">
      Opinionated product, opinionated answers.
    </p>
  </section>

  <!-- Sections -->
  {#each sections as section}
    <section class="space-y-4">
      <h2 class="text-[11px] uppercase tracking-wider text-surface-500">{section.category}</h2>
      <div class="space-y-3">
        {#each section.items as item}
          <div class="bg-surface-900 border border-surface-800 rounded-lg p-5 space-y-2">
            <h3 class="text-sm font-medium text-surface-300">{item.q}</h3>
            <p class="text-xs text-surface-500 leading-relaxed">{item.a}</p>
          </div>
        {/each}
      </div>
    </section>
  {/each}

</div>
