<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Why we built gittan"
  subtitle="Everything available was either too complex, too expensive, too limited, or too opinionated."
>
  <p>
    We spent years shipping software with GitHub, GitLab, Bitbucket, and self-hosted Gitea.
    None of them fit what we actually needed: trunk-based development with gated push,
    fast pipelines, team-centric permissions, and nothing else.
  </p>

  <p>
    GitHub is excellent at open source but bolts on enterprise features as afterthoughts.
    Actions is slow by design — every run provisions a fresh VM, pulls images from scratch,
    and installs dependencies from zero. SSO costs extra. Per-seat pricing scales linearly
    with headcount. The marketplace is a supply chain liability.
  </p>

  <p>
    GitLab does everything. That is the problem. The surface area is enormous. You get
    issues, wikis, package registries, container registries, security dashboards, compliance
    frameworks, value stream analytics — most of which your team will never touch. Every
    feature adds configuration, UI clutter, and upgrade risk.
  </p>

  <p>
    Bitbucket tried to be the Atlassian-integrated option. If your org already runs Jira,
    the integration is useful. If not, you are working around Atlassian assumptions at every
    turn.
  </p>

  <p>
    Gitea and Forgejo are lean and fast, but they are mirrors of GitHub's workflow: branches,
    pull requests, merge buttons. If you want a different development model, you are fighting
    the tool.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">What we wanted</h2>

  <p>
    A git host that enforces trunk-based development. Push to main, pipeline runs during
    push, results stream to the terminal. If the pipeline passes, the push is accepted. If
    it fails, the push is rejected. No branches, no PRs, no merge buttons.
  </p>

  <p>
    Teams own repos, not individuals. Permissions follow your identity provider's groups
    claim. You do not manage access lists — your org chart is your access model.
  </p>

  <p>
    Pipelines start in under a second because images are pre-pulled and runners are warm.
    Steps run in parallel via a DAG. A 10-minute GitHub Actions workflow might take 3 minutes
    on gittan because we are not provisioning infrastructure on every push.
  </p>

  <p>
    SSO on every plan because it is a security baseline, not a premium feature. Per-team
    pricing because adding a teammate should not cost you money.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">What we left out</h2>

  <p>
    No issues. No wiki. No project boards. No package registry. No marketplace.
    No stars, forks, or social features.
  </p>

  <p>
    These are not missing features. They are deliberate omissions. Issues belong in a
    dedicated tracker. Wikis belong in a documentation tool. Each of these is a product
    in its own right, and bundling a mediocre version into a git host helps no one.
  </p>

  <p>
    gittan does three things: git hosting, pipelines, and team management.
    We would rather do three things well than ten things poorly.
  </p>
</Article>
