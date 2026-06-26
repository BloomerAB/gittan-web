<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Security is a pipeline step, not a product tier"
  subtitle="Scanning and reporting on every push, for every team. Blocking on critical. Deeper analysis available for teams that want it."
>
  <p>
    On most git hosting platforms, security scanning is a premium feature. GitHub's
    Advanced Security costs extra per committer. GitLab's security dashboards are
    Ultimate-tier only. The message is clear: security is for enterprises that can
    afford it. Everyone else gets to hope for the best.
  </p>

  <p>
    This is backwards. Security is not a feature you upsell. It is a baseline that
    every team needs, regardless of size or budget. A startup with 4 developers is
    just as vulnerable to a dependency with a known CVE as a bank with 4,000.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Three tiers, clearly separated</h2>

  <p>
    gittan's security model has three distinct levels. We are explicit about what each
    one does, because blurring them creates false confidence.
  </p>

  <ul class="list-none space-y-3">
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Scanning and reporting — every push, every
      team.</strong> Dependency scanning, license compliance, container image analysis,
      secret detection. Runs on every push because the org's policies say it runs.
      Findings go into the team's report, tracked across pushes, visible in the
      dashboard. This is the baseline. It is included on every plan.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Blocking — critical CVEs only.</strong>
      A critical vulnerability in a production dependency, or a CVE listed in the CISA
      Known Exploited Vulnerabilities catalog, blocks the push. The pipeline fails. The
      code does not land on main. High and below go to the report, not the gate — because
      blocking on high creates constant friction on CVEs that are usually not exploitable,
      which drives routine overrides. The rubber-stamp problem, on security.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Reachability analysis — available for teams
      that want it.</strong> Is the CVE actually reachable in your code? Full reachability
      analysis is computationally heavy. It is available as a deeper analysis option,
      not included in the base tier. Baseline security — scanning, reporting, blocking
      on critical — is never behind a paywall. Deeper analysis is for teams that need
      it.</span>
    </li>
  </ul>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Why critical-only blocking</h2>

  <p>
    The instinct is to block on everything. Every CVE is a risk, so block them all. In
    practice, this creates a wall of red that developers learn to override. A high-severity
    CVE in a transitive dev dependency that is not reachable in production is not worth
    blocking a hotfix for. But if the gate blocks it, someone will find a way around the
    gate — and once the bypass habit forms, the gate stops being trusted.
  </p>

  <p>
    We block on two criteria: CVSS critical, or listed in the CISA Known Exploited
    Vulnerabilities catalog. CVSS severity alone is a blunt proxy. The KEV catalog lists
    what is actually exploited in the wild. Gating on "critical or known-exploited"
    captures most of the value of reachability analysis at near-zero build cost.
    Everything else goes to the report — scanned, tracked, visible, but not blocking.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The one safe exception</h2>

  <p>
    A no-exception block sounds principled until a critical CVE drops with no upstream
    patch. Now every push in the org is blocked — including the unrelated hotfix your
    team needs to ship. Unlike a <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">:latest</code>
    tag, which is always within your control to fix, an unpatched CVE is not.
  </p>

  <p>
    So the CVE gate has one exception mechanism: a time-boxed, logged risk acceptance
    by the owning team. The team records that they accept the risk, with an expiry. When
    the expiry lapses, the gate re-fires. This is not a bypass — it is an owned,
    auditable, time-limited decision. It ties to the vouch-vs-measure distinction from
    our <a href="/docs/no-pull-requests" class="text-accent-400 hover:text-accent-300 underline">gated push model</a>:
    the team owns the decision and is on record for it, rather than silently skipping a
    check.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Reports that accumulate</h2>

  <p>
    A single scan tells you what is wrong right now. What you need is a picture that
    builds over time: is this team's security posture improving or degrading? Are the
    same issues recurring? Are findings being addressed or ignored?
  </p>

  <p>
    gittan maintains security reports per team and per organization. Every pipeline run
    contributes. A vulnerability that appeared three weeks ago and is still present looks
    different from one that was introduced and fixed the same day. The report is a
    timeline, not a snapshot.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Security is a team concern</h2>

  <p>
    In many organizations, security is someone else's problem. The security team runs
    quarterly audits, produces a report, hands it to development, and waits. Development
    triages against their backlog, deprioritizes most findings, and the cycle repeats.
  </p>

  <p>
    This does not work. Security findings that are not surfaced to the team that owns
    the code, continuously, in the tool they already use, will be ignored. Not because
    the team does not care, but because the feedback loop is too slow and too removed
    from daily work.
  </p>

  <p>
    gittan puts security findings in the team's report, updated on every push. The team
    sees their security posture the same way they see their DORA metrics — as a
    continuous signal, not a quarterly surprise. When security is part of the daily
    workflow instead of a separate process, it actually gets addressed.
  </p>
</Article>
