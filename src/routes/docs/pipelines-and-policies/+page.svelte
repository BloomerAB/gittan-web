<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Pipelines and policies that help, not block"
  subtitle="Automatic pipelines for small teams. Platform guardrails for large ones. Reports over gates."
>
  <p>
    Most CI systems start with a blank file. You create a repo, and nothing happens until
    you write a pipeline config. For a team that has done this a hundred times, that is
    fine. For a team setting up their first service, it is a barrier. They copy a config
    from another repo, half of it does not apply, and the rest is missing something they
    need.
  </p>

  <p>
    gittan takes a different approach. Pipelines are not just something you write — they
    are something the platform provides.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Automatic pipelines for small teams</h2>

  <p>
    When a team creates a repo, gittan detects the project type and applies a sensible
    pipeline automatically. A Node.js project gets lint, test, and build steps. A Go
    project gets vet, test, and build. A Dockerfile-only repo gets build and scan. The
    team does not have to configure anything to get a working CI pipeline on their first
    push.
  </p>

  <p>
    These defaults are overridable. The team can add steps, remove steps, or replace the
    entire pipeline with a custom config. But the starting point is not a blank file — it
    is a working pipeline that follows the conventions of the language and framework the
    team is using.
  </p>

  <p>
    For small organizations, this is often enough. You get CI out of the box without
    needing a dedicated platform team to maintain pipeline templates. The tooling helps
    you do the right thing from day one.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Org policies for platform teams</h2>

  <p>
    Larger organizations have a platform team. Their job is to provide the infrastructure
    and guardrails that stream-aligned teams consume. In most CI systems, the platform
    team's options are limited: they can write documentation that nobody reads, maintain
    templates that teams forget to update, or gate deployments behind manual approvals
    that slow everyone down.
  </p>

  <p>
    gittan's org policies give platform teams a better mechanism. An org policy is a set
    of pipeline steps that are injected into every pipeline in the organization. The
    platform team controls these steps. Stream-aligned teams cannot remove or skip them.
    But critically — the default behavior is to report, not to block.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Reports over gates</h2>

  <p>
    The instinct when adding security or compliance checks to a pipeline is to make them
    blocking. If the license scanner finds a GPL dependency, fail the build. If the
    container scan finds a CVE, reject the push. This sounds responsible. In practice, it
    creates a culture where developers fight the tooling instead of learning from it.
  </p>

  <p>
    gittan policies default to advisory mode. A security scan runs on every push. If it
    finds a vulnerability, the result is added to a continuously updated report for the
    team. The push is not rejected. The developer sees the finding in their terminal
    output. The report accumulates findings over time — risks, recommendations,
    dependency issues, architecture concerns — building a living picture of the team's
    health.
  </p>

  <p>
    The platform team can choose to make specific checks blocking when the risk warrants
    it. A critical CVE in a base image, a license violation that creates legal exposure,
    a secret detected in source code — these are legitimate reasons to reject a push. But
    the default is to inform, not to obstruct. The team sees the risks. They prioritize
    them alongside their other work. They are treated as engineers who can make judgment
    calls, not as a compliance risk to be mitigated.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">What goes in a policy</h2>

  <p>
    Policies are not limited to security scanning. A platform team can inject any step
    that makes sense at the org level:
  </p>

  <ul class="list-none space-y-2">
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Security scanning</strong> — container image CVEs, dependency vulnerabilities, secret detection. Findings go to the team report.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">License compliance</strong> — flag dependencies with incompatible licenses. Advisory by default, blocking for known-bad licenses.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Architecture review</strong> — check that services follow org conventions. API schema validation, dependency direction rules, forbidden import patterns.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Image signing</strong> — sign built artifacts with cosign. This one is typically blocking — unsigned images should not reach production.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Test coverage thresholds</strong> — report when coverage drops below a target. Advisory, not blocking — coverage is a signal, not a goal.</span>
    </li>
  </ul>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The continuous report</h2>

  <p>
    Each team has a report that aggregates findings from every policy step across every
    push, across all of the team's repos. It is not a one-time audit — it is a living
    document that updates with every change. The report shows current risks, historical
    trends, and recommendations.
  </p>

  <p>
    The report is scoped to the team, not the individual repo, because that is how
    organizations actually think about risk. A platform team does not care about one CVE
    in one repo — they care about the security posture of the team that owns the payment
    service. A team lead does not need a report per repo — they need to see their team's
    overall health in one place.
  </p>

  <p>
    This is useful for the team because they can see their risk profile without running
    a separate tool. It is useful for the platform team because they get visibility across
    teams without asking each one for a status update. And it is useful for compliance
    because the report is an auditable record of what was checked, when, and what was
    found — organized by the team responsible for addressing it.
  </p>

  <p>
    The goal is not to generate paperwork. The goal is to surface information continuously
    so that risks are addressed incrementally, as part of normal development, instead of
    piling up until someone runs an annual security audit and finds six months of
    unpatched CVEs.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Trust the team</h2>

  <p>
    The philosophy behind this design is simple: teams are capable of making good
    decisions when they have good information. The platform team's job is to provide that
    information — through automatic pipelines, sensible defaults, and continuous reports —
    not to enforce decisions through blocking gates.
  </p>

  <p>
    Blocking is the last resort, reserved for things that genuinely cannot ship. Everything
    else is a recommendation. The team sees it, the team decides, the team owns the
    outcome. That is what autonomy looks like in practice.
  </p>
</Article>
