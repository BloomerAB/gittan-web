<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Why there are no stars, forks, or social features"
  subtitle="Stars measure marketing. DORA metrics measure engineering."
>
  <p>
    GitHub has stars. GitLab has stars. Every git host that copies their model has stars.
    The assumption is that a repository's quality correlates with its popularity. A repo
    with 50,000 stars must be good. A repo with 3 stars must not be.
  </p>

  <p>
    This is nonsense. A repo with 50,000 stars and a 200-second CI pipeline, no tests,
    and a single maintainer who burned out two years ago is worse than a repo with zero
    stars, 8-second CI, 90% test coverage, and a team that deploys daily. Stars measure
    reach, not quality. They are a marketing metric, not an engineering metric.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">What we measure instead</h2>

  <p>
    Gittan shows DORA metrics: deployment frequency, lead time for changes, change
    failure rate, and time to restore service. These are the metrics that the Accelerate
    research identified as predictors of software delivery performance. They tell you
    whether a team is shipping effectively — not whether their repo is famous.
  </p>

  <p>
    These metrics are visible per team on the dashboard. They are not optional, not
    behind an analytics add-on, not an enterprise feature. Every team sees their
    delivery performance because that is the thing that matters.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">No forks</h2>

  <p>
    Forking is a feature for open source collaboration. You fork a repo, make changes,
    and submit a pull request back to the original. It is a workflow designed for
    contributors who do not have write access.
  </p>

  <p>
    Gittan is for teams that work together on private code. Everyone on the team has
    write access. There is no need to fork — you push to the repo directly. If you need
    to experiment, use a feature flag, not a fork. Forks create divergence. Trunk-based
    development eliminates it.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">No activity graphs</h2>

  <p>
    The green contribution graph on GitHub profiles has become a proxy for developer
    productivity. Hiring managers look at it. Developers feel pressure to keep it green.
    The result is commits for the sake of commits — not for the sake of shipping.
  </p>

  <p>
    Gittan does not show individual activity. It shows team delivery. Did the team ship
    this week? How fast? How reliably? Those are the questions that matter. Whether one
    person made 47 commits and another made 3 is irrelevant — what matters is what the
    team delivered together.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Social features belong on social platforms</h2>

  <p>
    Stars, followers, trending repos, explore pages, profile READMEs, discussions,
    sponsors — these are social features. They make sense for GitHub because GitHub is
    both a development tool and a social network for developers. The social layer drives
    adoption, which drives the network effect, which is GitHub's moat.
  </p>

  <p>
    Gittan is not a social network. It is a tool for teams that ship software. Adding
    social features would not make it better at that job — it would add surface area,
    UI clutter, and features that distract from the thing we actually do well: fast
    pipelines, team ownership, and delivery metrics.
  </p>

  <p>
    We measure what the research says matters. Everything else is noise.
  </p>
</Article>
