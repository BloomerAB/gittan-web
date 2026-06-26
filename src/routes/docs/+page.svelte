<script lang="ts">
  const posts = [
    {
      slug: 'what-creates-quality',
      title: 'What actually creates software quality',
      subtitle: 'The research is clear. Most of the industry ignores it.',
    },
    {
      slug: 'flow',
      title: 'Why your team has no flow',
      subtitle: 'Slow pipelines and PR queues are not friction. They are the reason your DORA metrics are red.',
    },
    {
      slug: 'research-driven',
      title: 'Features built on research, not feature requests',
      subtitle: 'Accelerate and Team Topologies are our product spec. Not customer wishlists.',
    },
    {
      slug: 'teams-own-everything',
      title: 'Teams own everything. Individuals own nothing.',
      subtitle: 'There is no personal namespace in gittan. Code belongs to teams, because that is how quality happens.',
    },
    {
      slug: 'no-permission-levels',
      title: 'Two permission levels: read everything, own your team',
      subtitle: 'You are either in the team or you are not. There is no in-between.',
    },
    {
      slug: 'why-gittan',
      title: 'Why we built gittan',
      subtitle: 'The existing platforms have no direction. We built one that cares whether your team ships well.',
    },
    {
      slug: 'no-pull-requests',
      title: 'It is gated. It is stricter than a PR.',
      subtitle: 'We did not remove the gate. We removed the human-as-bottleneck from the gate.',
    },
    {
      slug: 'small-batches',
      title: 'Small batches and the case for advisory review',
      subtitle: 'When every change is small enough to revert in minutes, pre-approval stops being the only safety net.',
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
      slug: 'security-by-default',
      title: 'Security is a pipeline step, not a product tier',
      subtitle: 'Scanning and reporting on every push, for every team. Blocking on critical. Deeper analysis available for teams that want it.',
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
      slug: 'polyrepo',
      title: 'Why we built for polyrepos',
      subtitle: 'Monorepos solve a tooling problem by creating a platform problem. We solved the tooling problem instead.',
    },
    {
      slug: 'cascade-pipelines',
      title: 'Cascade pipelines: monorepo safety without the monorepo',
      subtitle: 'When a shared dependency passes, downstream repos are tested automatically.',
    },
    {
      slug: 'no-dependabot',
      title: 'Why gittan does not update your dependencies',
      subtitle: 'Dependency updates are engineering decisions. Not automation.',
    },
    {
      slug: 'no-marketplace',
      title: 'In a gittan pipeline, everything has a pin',
      subtitle: 'No marketplace. Modules pinned by digest. A curated set is paved. Everything else is your explicit responsibility.',
    },
    {
      slug: 'no-latest-tags',
      title: 'Why we ban the latest tag',
      subtitle: 'Every image in a gittan pipeline has a timestamp and a commit SHA. No exceptions.',
    },
    {
      slug: 'no-vanity-metrics',
      title: 'Why there are no stars, forks, or social features',
      subtitle: 'Stars measure marketing. DORA metrics measure engineering.',
    },
    {
      slug: 'reliability',
      title: 'We build so we do not need a status page',
      subtitle: 'A git host should be invisible. You push, it works. That is the ambition.',
    },
    {
      slug: 'eu-sovereignty',
      title: 'Why gittan runs in the EU',
      subtitle: 'Your source code is your business. It should stay in your jurisdiction.',
    },
    {
      slug: 'saas-only',
      title: 'Why gittan is SaaS only',
      subtitle: 'Shared infrastructure, many moving parts, and a deliberate choice.',
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
      gittan is built for polyrepo with small repos and simple pipelines, optimised for trunk-based development and flow.
      These posts explain every deliberate choice, with the reason and the trade-off.
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
