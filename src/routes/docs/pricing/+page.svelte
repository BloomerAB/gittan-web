<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Pricing that does not punish collaboration"
  subtitle="Per-seat pricing creates perverse incentives. We charge per team."
>
  <p>
    Most git hosting platforms charge per user. The more people on your team, the more you
    pay. This sounds reasonable until you think about the incentives it creates.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The per-seat problem</h2>

  <p>
    Need a contractor for two weeks? That costs you a seat for the month. Want a junior
    developer to shadow a senior? That costs you a seat. QA engineer needs read access to
    verify a fix? Another seat. Someone from the security team needs to audit the code?
    Another seat.
  </p>

  <p>
    Per-seat pricing turns every access decision into a cost decision. Managers start
    gatekeeping access not because of security, but because of budget. The result is that
    people who should have access to code do not, and the team works around the restriction
    with shared credentials, screenshots, and copy-pasted snippets.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">How gittan charges</h2>

  <p>
    gittan has two plans: Starter and Team. Both charge a flat monthly fee. The Starter plan
    includes 2 users. The Team plan includes unlimited users. Adding a person to your org
    costs nothing on the Team plan.
  </p>

  <p>
    The limits are on resources, not people: CI minutes, storage, and number of repos on
    the Starter plan. These are the things that actually cost us money to provide. Authenticating
    an additional user costs us nothing, so we do not charge for it.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Why not free tier?</h2>

  <p>
    Free tiers attract users who do not pay. That is obvious. What is less obvious is that
    free-tier users have different needs than paying customers, and supporting both pulls the
    product in conflicting directions.
  </p>

  <p>
    Free tiers are a customer acquisition strategy for platforms that compete on network
    effects. GitHub needs millions of users because public repos, stars, and contributions
    form its moat. gittan does not have social features. We do not benefit from volume. We
    benefit from teams that ship software and are willing to pay for a tool that helps them
    do it faster.
  </p>

  <p>
    The Starter plan at &euro;29/month is cheap enough that the decision is trivial for any
    professional team. If &euro;29 is a significant expense for your organization, you are
    probably better served by a self-hosted Forgejo instance, which is free and excellent.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">CI minutes are worth more here</h2>

  <p>
    A common reaction to our pricing is that 10,000 CI minutes sounds like less than GitHub's
    included minutes. But our minutes are not equivalent. A pipeline that takes 10 minutes on
    GitHub Actions might take 3 minutes on gittan because we pre-pull images, use warm runners,
    and execute steps in parallel via a DAG.
  </p>

  <p>
    You are not paying for wall-clock time spent provisioning infrastructure. You are paying
    for time spent running your code. That is a meaningful difference.
  </p>
</Article>
