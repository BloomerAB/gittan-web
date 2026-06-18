<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="An org changelog that humans can read"
  subtitle="What did the team ship this week? Not commits. Not tickets. Features."
>
  <p>
    Every engineering leader has the same problem: they want to know what their teams
    are delivering, but the tools they have show the wrong thing. Git logs show commits.
    Jira shows ticket state changes. CI dashboards show pipeline runs. None of these
    answer the question they are actually asking: what changed for our users this week?
  </p>

  <p>
    The gap between engineering artifacts and business outcomes is where misunderstanding
    lives. A manager sees 47 commits and has no idea if that was one feature or a week
    of refactoring. A team lead sees 12 closed tickets and cannot tell if they were
    critical fixes or backlog grooming. The information exists, but it is trapped in a
    format designed for engineers, not for the people who need to communicate progress
    to the rest of the organization.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The org changelog</h2>

  <p>
    gittan maintains an org-level changelog — a feed of what each team has shipped,
    written in plain language. Not commit messages. Not ticket IDs. Descriptions of
    features, fixes, and changes that a non-engineer can understand.
  </p>

  <p>
    When a team pushes a change, the pipeline passes, and code lands on main, the team
    can attach a changelog entry. A short description of what changed and why it matters.
    "Users can now export invoices as PDF." "Search results load 3x faster on mobile."
    "Fixed a bug where notifications were sent twice after password reset."
  </p>

  <p>
    These entries accumulate into a timeline per team. At the org level, every team's
    timeline merges into a single feed. A CTO opening gittan on Monday morning sees
    what every team shipped last week — in language they can forward to the board, paste
    into a stakeholder update, or use in a quarterly review.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Why this is not a commit log</h2>

  <p>
    Commit messages are for engineers. They describe what changed in the code:
    "refactor auth middleware to use token rotation" or "bump openssl to 3.2.1". These
    are useful in a git log. They are meaningless in a leadership update.
  </p>

  <p>
    The changelog is a separate artifact. It is written by the team, for the
    organization. Not every push needs an entry — a dependency bump or a typo fix is not
    worth communicating. But when the team ships something that matters to users, to
    stakeholders, or to other teams, they write a line about it. The discipline of
    writing that line also forces the team to think about what they are delivering in
    terms of outcomes, not outputs.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Visibility without surveillance</h2>

  <p>
    The common alternative is status meetings. Standups, weekly syncs, sprint reviews,
    all-hands demos — ceremonies where teams report what they have done to an audience
    that could have read it instead. These meetings exist because the information is not
    available anywhere else in a consumable format.
  </p>

  <p>
    The org changelog makes those meetings optional. The information is there, updated
    continuously, in a format anyone can read. A product manager can see what the backend
    team shipped without joining their standup. A VP of Engineering can see what all
    teams shipped without scheduling a round of 1:1s. The information flows without the
    ceremony.
  </p>

  <p>
    This is not surveillance. The changelog does not track who committed what, how many
    lines were changed, or how many hours someone worked. It tracks what the team — as
    a unit — delivered. The team writes the entries. The team decides what is worth
    communicating. The team controls the narrative.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">A shared language</h2>

  <p>
    One of the hardest problems in engineering organizations is translating between
    engineering language and business language. Engineers think in systems, APIs, and
    deployments. Business thinks in features, customers, and revenue. The changelog is
    a bridge.
  </p>

  <p>
    When an engineer writes "users can now filter dashboards by date range," both the
    team and the stakeholder understand what shipped. There is no translation layer, no
    project manager writing a separate status report, no game of telephone between the
    person who wrote the code and the person who reports to the board.
  </p>

  <p>
    Over time, the changelog becomes the canonical record of what the organization has
    built. Not in terms of code, but in terms of capability. That is the thing that
    actually matters.
  </p>
</Article>
