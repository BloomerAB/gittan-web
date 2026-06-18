<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Why we removed pull requests"
  subtitle="PRs conflate code review with code gating. We separated them."
>
  <p>
    Pull requests solve two problems at once: they gate code from reaching main, and they
    provide a place for code review. The issue is that these are different concerns with
    different requirements, and merging them creates overhead that slows teams down.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The gating problem</h2>

  <p>
    You want to prevent broken code from reaching main. That is a legitimate engineering
    concern. The PR model solves it by requiring manual approval before merge. But manual
    approval is a bottleneck. The reviewer might be in a meeting, on vacation, or working
    on something else. Your change sits in a queue.
  </p>

  <p>
    Meanwhile, the branch diverges from main. Other changes land. By the time you get
    approval, you might need to rebase. The longer the branch lives, the harder the merge.
    This is not a theoretical concern — it is the daily reality of every team using
    long-lived branches.
  </p>

  <p>
    Gittan replaces the manual gate with an automated one. When you push to main, a
    pre-receive hook triggers your pipeline. If the pipeline passes, the push is accepted.
    If it fails, the push is rejected and the error output streams to your terminal. The
    gate is still there — it is just faster, more consistent, and never on vacation.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The review problem</h2>

  <p>
    Code review is valuable. We are not arguing against it. We are arguing against the
    PR as the only mechanism for it.
  </p>

  <p>
    Pair programming is code review in real time. Mob programming is code review with the
    whole team. Post-commit review on main catches things that pre-merge review would have
    caught, but without blocking the author. Async review of commits works fine when changes
    are small and frequent — which they are when you practice trunk-based development.
  </p>

  <p>
    The PR model assumes that the only valid review happens before merge, in a web UI, on
    a feature branch. That is one way to do it. It is not the only way, and for many teams
    it is not the best way.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Smaller changes, less risk</h2>

  <p>
    When the cost of shipping is low — push and wait a few seconds — developers make smaller
    changes. Smaller changes are easier to review, easier to understand, and easier to revert.
    The risk per change goes down.
  </p>

  <p>
    When the cost of shipping is high — create branch, open PR, wait for CI, wait for review,
    address comments, wait again, merge — developers batch changes. Bigger changes are harder
    to review and harder to revert. The risk per change goes up.
  </p>

  <p>
    We chose the model that incentivizes small, frequent changes over the model that
    incentivizes large, infrequent ones.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">What about compliance?</h2>

  <p>
    Some regulated environments require pre-merge review as policy. If that is your
    situation, Gittan's org policies can enforce a review step in the pipeline — a sign-off
    that is recorded and auditable. But the mechanism is a pipeline step, not a PR. The
    policy is enforced by code, not by human process.
  </p>
</Article>
