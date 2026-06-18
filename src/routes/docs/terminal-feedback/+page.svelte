<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Why pipeline results belong in the terminal"
  subtitle="You are already there. Opening a browser is a context switch."
>
  <p>
    You just ran <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">git push</code>.
    You are in the terminal. You are thinking about the change you just made. On every other
    platform, the next step is: open a browser, navigate to the repo, find the pipeline run,
    and wait for results. That is a context switch away from the place where you do your work.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The notification trap</h2>

  <p>
    CI platforms try to solve the feedback loop with notifications. A Slack message when the
    build passes. An email when it fails. A browser notification if you remembered to enable
    it. None of these are good. Slack messages get buried. Emails are slow. Browser
    notifications pop up at the wrong time.
  </p>

  <p>
    The fundamental issue is that notifications are asynchronous. They arrive later, in a
    different context, when you are doing something else. By the time you see the notification,
    you have moved on. Now you have to context-switch back to figure out what broke.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Synchronous feedback</h2>

  <p>
    Gittan streams pipeline output to your terminal during <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">git push</code>.
    The push does not complete until the pipeline finishes. You see each step start, run, and
    complete — in real time, in the same window where you ran the command.
  </p>

  <p>
    If a step fails, you see the error output immediately. You are already in the terminal.
    You can fix the issue, commit, and push again. The feedback loop is seconds, not minutes.
  </p>

  <p>
    This only works because Gittan pipelines are fast. If a pipeline takes 20 minutes,
    blocking the push is not practical. But when pipelines run in single-digit seconds — which
    they do when you pre-pull images, use warm runners, and parallelize steps — blocking is
    not just practical, it is the better developer experience.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The web dashboard still exists</h2>

  <p>
    Gittan has a web UI. It shows pipeline history, DORA metrics, team activity, and repo
    status. It is useful for managers, for debugging intermittent failures, and for getting
    a high-level view of team health.
  </p>

  <p>
    But the web UI is not where developers live. Developers live in the terminal and the
    editor. The feedback loop for "did my push succeed" should happen where the developer
    already is, not where the platform vendor thinks they should be.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Why this matters</h2>

  <p>
    Developer experience is not about polish. It is about removing friction from the
    feedback loop. Every tab switch, every page load, every notification that arrives 30
    seconds late is friction. Terminal feedback removes all of it.
  </p>

  <p>
    When the cost of checking CI results is zero — because you are already looking at them —
    developers push more often, catch issues earlier, and spend less time waiting. That is
    not a minor workflow improvement. It compounds across every push, every day, every
    developer on the team.
  </p>
</Article>
