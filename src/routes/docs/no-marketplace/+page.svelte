<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="In a gittan pipeline, everything has a pin"
  subtitle="No marketplace. Modules pinned by digest. A curated set is paved. Everything else is your explicit responsibility."
>
  <p>
    GitHub Actions has a marketplace with thousands of community-built actions. Need to
    deploy to AWS? There is an action. Need to send a Slack notification? There is an
    action. This is convenient. It is also a supply chain risk that most teams
    underestimate, and that we refuse to normalize.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The supply chain problem</h2>

  <p>
    When you add <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">uses: some-org/some-action@v3</code>
    to your workflow, you are running code written by someone you do not know, with full
    access to your repository's secrets, source code, and CI environment. The action can
    read your deploy keys, exfiltrate environment variables, and modify the code being
    built.
  </p>

  <p>
    This is not theoretical. In early 2024, a widely-used GitHub Action was compromised,
    leaking CI/CD secrets from repositories that used it. The attack surface is every
    third-party action in every workflow in every repository.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Relocating the risk is not removing it</h2>

  <p>
    gittan pipelines use Dagger modules instead of marketplace actions. Dagger is
    excellent — but the Daggerverse is a public community registry. Trusting it
    wholesale is the marketplace risk relocated, not removed. A team that pulls
    arbitrary community modules into their pipeline has the same supply chain exposure
    as a team using unaudited GitHub Actions.
  </p>

  <p>
    We are honest about this because a security page that says "marketplace = needless
    supply-chain risk" while pulling arbitrary community modules on the other side is
    not a security page. It is marketing. We apply our own thesis consistently.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Three layers of control</h2>

  <p>
    The same principle that drives the <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">no :latest</code>
    gate applies to modules: in a gittan pipeline, everything has a pin.
  </p>

  <ul class="list-none space-y-3">
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Pin by digest, not tag.</strong> Every module
      reference must be content-addressed — commit SHA or digest, never a floating ref.
      A module pulled at <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">@main</code>
      can change under you. A pinned one cannot. This is content-addressing applied to
      supply chain — the most on-brand control we have.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Vendor what you trust.</strong> Mirror a
      curated set of approved modules into a gittan-controlled namespace. Paved-road
      pipelines pull only from the vetted mirror, not the open Daggerverse. This is the
      platform-as-enabler pattern: the platform team curates, the teams consume.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">First-party as default, third-party as
      explicit off-road.</strong> Base pipelines use only gittan- or team-authored modules.
      Pulling an external module is possible but is a deliberate, logged act — the team's
      responsibility, not a silent default.</span>
    </li>
  </ul>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Reuse without risk</h2>

  <p>
    Teams still share CI logic. The mechanism is team templates — a set of pipeline steps
    that apply to every repo in a team. If your backend team uses the same lint, test, and
    build steps across 20 repos, that is one template, not 20 copy-pasted configs.
  </p>

  <p>
    The difference is that the template is owned by your team, stored in your org, and
    governed by your policies. It is not a third-party dependency you hope stays maintained
    and uncompromised.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">What it costs</h2>

  <p>
    No marketplace means no one-click integrations. If you need a CI step that sends a
    Slack notification, you write a module or use one from the curated set. There is no
    community-maintained action that does it for you with zero effort. The trade-off is
    explicit: less convenience, more control, no supply chain surprises. For CI — where
    your secrets are present and your artifacts are produced — we believe control matters
    more.
  </p>
</Article>
