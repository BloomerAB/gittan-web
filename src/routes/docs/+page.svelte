<script lang="ts">
  const posts = [
    {
      slug: 'what-creates-quality',
      title: 'What actually creates software quality',
      subtitle: 'The research is clear. Most of the industry ignores it.',
    },
    {
      slug: 'research-driven',
      title: 'Features built on research, not feature requests',
      subtitle: 'Accelerate and Team Topologies are our product spec. Not customer wishlists.',
    },
    {
      slug: 'teams-own-everything',
      title: 'Teams own everything. Individuals own nothing.',
      subtitle: 'There is no personal namespace in Gittan. Code belongs to teams, because that is how quality happens.',
    },
    {
      slug: 'no-permission-levels',
      title: 'Two permission levels: read everything, own your team',
      subtitle: 'You are either in the team or you are not. There is no in-between.',
    },
    {
      slug: 'why-gittan',
      title: 'Why we built Gittan',
      subtitle: 'Everything available was either too complex, too expensive, too limited, or too opinionated.',
    },
    {
      slug: 'no-pull-requests',
      title: 'Why we removed pull requests',
      subtitle: 'PRs conflate code review with code gating. We separated them.',
    },
    {
      slug: 'pricing',
      title: 'Pricing that does not punish collaboration',
      subtitle: 'Per-seat pricing creates perverse incentives. We charge per team.',
    },
    {
      slug: 'sso-included',
      title: 'SSO is a security feature, not a premium add-on',
      subtitle: 'Gating SSO behind enterprise tiers forces small teams into weaker authentication.',
    },
    {
      slug: 'pipelines-and-policies',
      title: 'Pipelines and policies that help, not block',
      subtitle: 'Automatic pipelines for small teams. Platform guardrails for large ones. Reports over gates.',
    },
    {
      slug: 'org-changelog',
      title: 'An org changelog that humans can read',
      subtitle: 'What did the team ship this week? Not commits. Not tickets. Features.',
    },
    {
      slug: 'why-slack',
      title: 'Why we integrate with Slack and not Microsoft Teams',
      subtitle: 'Everything about Teams is a project. We chose not to start one.',
    },
    {
      slug: 'cascade-pipelines',
      title: 'Cascade pipelines: monorepo safety without the monorepo',
      subtitle: 'When a shared dependency passes, downstream repos are tested automatically.',
    },
    {
      slug: 'no-dependabot',
      title: 'Why Gittan does not update your dependencies',
      subtitle: 'Dependency updates are engineering decisions. Not automation.',
    },
    {
      slug: 'no-marketplace',
      title: 'Your CI should not run third-party code',
      subtitle: 'Marketplace actions are a supply chain risk you do not need.',
    },
    {
      slug: 'no-latest-tags',
      title: 'Why we ban the latest tag',
      subtitle: 'Every image in a Gittan pipeline has a timestamp and a commit SHA. No exceptions.',
    },
    {
      slug: 'no-vanity-metrics',
      title: 'Why there are no stars, forks, or social features',
      subtitle: 'Stars measure marketing. DORA metrics measure engineering.',
    },
    {
      slug: 'reliability',
      title: 'Your git host should not have incident pages',
      subtitle: 'GitHub has had more outages in the last two years than we have had deployments that failed.',
    },
    {
      slug: 'eu-sovereignty',
      title: 'Why Gittan runs in the EU',
      subtitle: 'Your source code is your business. It should stay in your jurisdiction.',
    },
    {
      slug: 'saas-only',
      title: 'Why Gittan is SaaS only',
      subtitle: 'The product is the infrastructure. You cannot separate them.',
    },
    {
      slug: 'terminal-feedback',
      title: 'Why pipeline results belong in the terminal',
      subtitle: 'You are already there. Opening a browser is a context switch.',
    },
  ]
</script>

<div class="max-w-2xl mx-auto px-6 py-12 space-y-10">

  <section class="space-y-2">
    <h1 class="text-3xl font-bold text-surface-200 tracking-tight">How we think</h1>
    <p class="text-surface-500 text-sm">
      Gittan is an opinionated product. These posts explain why.
    </p>
  </section>

  <div class="space-y-3">
    {#each posts as post}
      <a
        href="/docs/{post.slug}"
        class="block bg-surface-900 border border-surface-800 rounded-lg p-5 space-y-1.5 hover:border-surface-700 transition-colors"
      >
        <h2 class="text-sm font-medium text-surface-300">{post.title}</h2>
        <p class="text-xs text-surface-500">{post.subtitle}</p>
      </a>
    {/each}
  </div>

</div>
