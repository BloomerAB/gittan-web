<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Security is a pipeline step, not a product tier"
  subtitle="Every push is scanned. Every team gets a report. No add-on required."
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

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Built into the pipeline</h2>

  <p>
    In gittan, security scanning runs as part of the pipeline. Not as an optional step
    the team has to configure. Not as a marketplace action they have to find, evaluate,
    and maintain. It runs because the organization's policies say it runs. On every push,
    for every repo, for every team.
  </p>

  <p>
    This is a org-level policy, not a repo-level config. The platform team defines what
    security steps apply — dependency scanning, license compliance, container image
    analysis, secret detection — and those steps are injected into every pipeline
    automatically. Individual teams cannot opt out, because security is not optional.
  </p>

  <p>
    Teams can add their own security steps on top. A team handling payment data might
    add stricter checks. But the baseline is set by the organization and enforced by
    the platform.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Reports that accumulate</h2>

  <p>
    A single scan tells you what is wrong right now. That is useful but insufficient.
    What you actually need is a picture that builds over time: is this team's security
    posture improving or degrading? Are the same issues recurring? Are findings being
    addressed or ignored?
  </p>

  <p>
    gittan maintains security reports per team and per organization. Every pipeline run
    contributes to the report. Findings are tracked across pushes — a vulnerability that
    appeared three weeks ago and is still present is visibly different from one that was
    introduced and fixed in the same day. The report is not a snapshot. It is a timeline.
  </p>

  <p>
    This gives platform teams and security teams something they rarely have: a
    continuous view of security across every team, without asking anyone to fill out a
    spreadsheet or run a manual audit. The data comes from the pipeline. It is always
    current.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Recommendations, not blockers</h2>

  <p>
    Not every finding is critical. A medium-severity CVE in a dev dependency does not
    need to block a push. A license compliance warning on an internal tool does not need
    to stop deployment.
  </p>

  <p>
    gittan's security policies distinguish between findings that block and findings that
    report. A critical vulnerability in a production dependency blocks the push — the
    pipeline fails, the code does not land on main. A medium-severity finding is recorded
    in the team's report, visible in the dashboard, tracked over time — but the push
    proceeds.
  </p>

  <p>
    The goal is not to create a wall of red that developers learn to ignore. It is to
    surface risks proportionally: block the things that must be blocked, track the things
    that should be tracked, and give the team a clear picture of where they stand without
    turning every push into a compliance exercise.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Architecture and structure reviews</h2>

  <p>
    Security scanning is the first step. The pipeline can also assess structural concerns:
    is the team following established architecture patterns? Are there inconsistencies
    that suggest technical debt accumulating? Is a service growing in ways that suggest
    it should be split?
  </p>

  <p>
    These are not pass/fail checks. They are observations that feed into the team's
    report. Over time, patterns emerge. A team that consistently introduces new
    dependencies without removing old ones has a different risk profile than a team with
    a stable dependency tree. The platform surfaces this — not as a judgment, but as
    information the team and the organization can act on.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Security is a team concern</h2>

  <p>
    In many organizations, security is someone else's problem. The security team runs
    audits quarterly, produces a report, hands it to the development team, and waits.
    The development team triages the findings against their backlog, deprioritizes most
    of them, and the cycle repeats.
  </p>

  <p>
    This does not work. Security findings that are not surfaced to the team that owns
    the code, continuously, in the tool they already use, will be ignored. Not because
    the team does not care, but because the feedback loop is too slow and too removed
    from their daily work.
  </p>

  <p>
    gittan puts security findings in the team's report, updated on every push. The team
    sees their security posture the same way they see their DORA metrics — as a
    continuous signal, not a quarterly surprise. When security is part of the daily
    workflow instead of a separate process, it actually gets addressed.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">No separate product to buy</h2>

  <p>
    Security scanning is included on every gittan plan. There is no Advanced Security
    tier. There is no per-committer surcharge. There is no marketplace action to
    configure and hope it keeps working after the next major version bump.
  </p>

  <p>
    Security is part of the pipeline because the pipeline is where code quality is
    enforced. Separating security into its own product, with its own pricing, creates
    an incentive to skip it. We removed that incentive.
  </p>
</Article>
