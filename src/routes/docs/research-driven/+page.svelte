<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Features built on research, not feature requests"
  subtitle="Accelerate and Team Topologies are our product spec. Not customer wishlists."
>
  <p>
    Gittan is not shaped by feature requests. It is shaped by research. Specifically, the
    findings in <em class="text-surface-300">Accelerate</em> by Nicole Forsgren, Jez Humble,
    and Gene Kim, and <em class="text-surface-300">Team Topologies</em> by Matthew Skelton
    and Manuel Pais. These books are not opinions — they are the result of years of
    large-scale research into what actually makes software teams perform.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">What Accelerate tells us</h2>

  <p>
    The DORA research program studied thousands of teams across industries and identified
    four key metrics that predict software delivery performance: deployment frequency, lead
    time for changes, change failure rate, and time to restore service. High-performing
    teams score well on all four. Low-performing teams score poorly on all four. There is
    no trade-off between speed and stability — the best teams have both.
  </p>

  <p>
    The research also identified the capabilities that drive these metrics. Trunk-based
    development. Continuous integration. Small batch sizes. Fast feedback loops. Loosely
    coupled architecture. Team autonomy. These are not preferences or trends. They are
    statistically validated predictors of engineering performance.
  </p>

  <p>
    Every feature in Gittan maps to one or more of these capabilities. Gated push enforces
    continuous integration. Terminal feedback shortens the feedback loop. No long-lived
    branches means trunk-based development. DORA metrics on the dashboard make performance
    visible, not as a management surveillance tool, but as a team health indicator.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">What Team Topologies tells us</h2>

  <p>
    Team Topologies establishes that how you organize teams determines how your software
    is shaped — Conway's Law, applied deliberately. It defines four team types: stream-aligned,
    platform, enabling, and complicated-subsystem. The key insight is that teams need clear
    ownership, minimal cognitive load, and well-defined interaction modes.
  </p>

  <p>
    Gittan's permission model is team-centric because Team Topologies says that is how
    high-performing organizations work. Teams own repos, not individuals. Access follows
    team boundaries, not org charts of individual contributors. When a team is responsible
    for a service, they control its code, its pipeline, and its deployment. No tickets to
    a central platform team to change a CI config.
  </p>

  <p>
    Org policies exist to give the platform team guardrails without bottlenecking
    stream-aligned teams. The platform team sets security gates and compliance steps. The
    stream-aligned team decides everything else. This maps directly to the Team Topologies
    interaction mode of "X-as-a-Service" — the platform provides the service, the team
    consumes it, and neither blocks the other.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">DORA metrics built into the product</h2>

  <p>
    Most teams that want DORA metrics have to bolt on a separate tool — Sleuth, LinearB,
    Jellyfish — that scrapes data from their git host and CI system, correlates it, and
    produces dashboards. This is expensive, fragile, and always slightly wrong because
    the tool is reconstructing intent from artifacts.
  </p>

  <p>
    Gittan owns the entire pipeline from push to deploy. We know exactly when a commit
    was pushed, how long the pipeline took, whether it passed or failed, and when the
    change reached production. We do not need to guess or scrape. The four DORA metrics
    are computed directly from data we already have:
  </p>

  <ul class="list-none space-y-2">
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Deployment frequency</strong> — how often the team pushes to main. Gittan counts every accepted push.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Lead time for changes</strong> — from commit to main. With gated push there is no branch or PR lag, so this is effectively the pipeline duration.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Change failure rate</strong> — the percentage of pushes that are rejected by the pipeline. A high rate means the team is pushing broken code. A low rate means the local development loop is catching issues before push.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Time to restore service</strong> — how quickly the team ships a fix after a failure. Gittan tracks the time between a failed push and the next successful one.</span>
    </li>
  </ul>

  <p>
    These metrics are shown per team on the dashboard. They are not hidden behind an
    analytics add-on or enterprise tier. Every team on every plan sees how they are
    performing against the benchmarks from the DORA research. The goal is not to rank
    teams against each other — it is to give each team visibility into their own delivery
    health so they can improve on their own terms.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">How we evaluate feature requests</h2>

  <p>
    When someone asks for a feature, we do not ask "do customers want this?" We ask: "does
    the research support this?" If a feature would improve one of the four DORA metrics
    without degrading the others, it is worth considering. If it would reduce team autonomy,
    increase batch size, or lengthen feedback loops, it is not — regardless of how many
    people ask for it.
  </p>

  <p>
    This means we will say no to things that other platforms consider table stakes. Approval
    gates that require a manager's sign-off before deploy? That increases lead time and adds
    a bottleneck. The research says it makes teams slower without making them safer. We will
    not build it.
  </p>

  <p>
    Branch protection rules that force multi-step merge ceremonies? That increases batch size
    because developers accumulate changes while waiting. The research says small, frequent
    integrations outperform large, infrequent ones. We will not build it.
  </p>

  <p>
    Dashboard features that let managers track individual developer output? The research is
    explicit: measuring individual productivity does not predict team performance and actively
    harms it when used as a management tool. We will not build it.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Control vs. delivery</h2>

  <p>
    Many features in enterprise software exist to give managers a sense of control.
    Approval workflows, access reviews, activity dashboards, audit trails of who did what
    and when. Some of these serve real compliance needs. Many exist because someone in
    procurement asked for them, and the vendor said yes to close the deal.
  </p>

  <p>
    We optimize for delivery and quality, not control. If a feature helps teams ship better
    software faster, we will build it. If it exists so that someone higher in the org chart
    can feel informed without talking to the team, we will not. The team's ability to deliver
    always takes priority over a manager's desire to monitor.
  </p>

  <p>
    This is not anti-management. Good managers want their teams to be autonomous and
    effective. The DORA research shows that organizational culture — specifically,
    generative culture with high trust — is the strongest predictor of performance. Tools
    that enforce control undermine trust. Tools that enable autonomy build it.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Moving the industry</h2>

  <p>
    We know this position is not mainstream. Most git hosting platforms compete on feature
    count. The vendor with the longest feature comparison table wins the procurement
    spreadsheet. The result is feature bloat — products that do everything and do none of
    it well. Every feature adds configuration surface, UI complexity, cognitive load, and
    maintenance burden. Teams end up navigating a tool instead of using it. We will lose
    those feature comparisons. That is fine.
  </p>

  <p>
    We believe the industry is moving in the wrong direction — more process, more ceremony,
    more features that exist to satisfy auditors and middle managers rather than help
    engineers ship. The research has been clear for years: the practices that produce the
    best outcomes are simple, fast, and trust-based.
  </p>

  <p>
    Gittan exists to prove that a tool built on those principles can work for real teams
    at real companies. Not as an experiment, but as production infrastructure. If we can
    demonstrate that fewer features and more trust produces better outcomes, maybe the rest
    of the industry will follow.
  </p>

  <p>
    If not, at least the teams that use Gittan will ship faster.
  </p>
</Article>
