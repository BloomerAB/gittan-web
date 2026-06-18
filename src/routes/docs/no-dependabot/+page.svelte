<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Why Gittan does not update your dependencies"
  subtitle="Dependency updates are engineering decisions. Not automation."
>
  <p>
    Dependabot and Renovate are among the most widely adopted tools in modern software
    development. They are also among the most universally disliked. Ask any developer
    about their Renovate experience and you will hear the same thing: dozens of automated
    pull requests piling up, most of them ignored, creating noise that drowns out actual
    work.
  </p>

  <p>
    Gittan does not include automated dependency updates. You can run Renovate or
    Dependabot against your Gittan repos if you want — nothing prevents it. But we will
    not build it into the product, and we recommend against it.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The automation trap</h2>

  <p>
    Automated dependency updates sound responsible. A bot watches your dependencies,
    detects new versions, and opens a PR to bump them. The theory is that you stay
    current, reduce CVE exposure, and never fall behind.
  </p>

  <p>
    The reality is different. The bot opens 15 PRs on Monday morning. Three are patch
    releases that change nothing meaningful. Four are minor versions that probably work
    but nobody has time to verify. Two are major versions that require code changes. Six
    are transitive dependencies you have never heard of.
  </p>

  <p>
    The team triages, merges the obvious ones, ignores the rest, and by Wednesday the bot
    has opened 8 more. The PRs pile up. The backlog grows. Eventually someone bulk-merges
    everything to clear the queue, and now you have 20 dependency changes in one day with
    no clear understanding of what changed or why.
  </p>

  <p>
    This is not staying current. This is automation theater.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Dependencies are decisions</h2>

  <p>
    Updating a dependency is not a chore to automate — it is an engineering decision.
    Does the new version change behavior your code depends on? Does it drop support for
    a runtime you use? Does it introduce a new transitive dependency with a license you
    cannot accept? Does the maintainer still have the trust of the community, or did the
    project change hands last month?
  </p>

  <p>
    These are questions that require judgment. A bot that opens a PR with "bump express
    from 4.18.2 to 4.19.0" cannot answer them. A developer who reads the changelog,
    checks the diff, and understands the implications can.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">What Gittan does instead</h2>

  <p>
    Gittan's team reports include dependency health as part of the continuous report.
    When a dependency has known vulnerabilities, is significantly outdated, or has been
    flagged by the org's license policy, it appears in the report. The team sees it
    alongside their other risks and recommendations.
  </p>

  <p>
    The difference is intent. An automated PR says "do this now." A report entry says
    "you should know about this." The team decides when to update, batches related
    updates together, tests them properly, and ships them as a deliberate change — not
    as a bot-generated PR they rubber-stamped.
  </p>

  <p>
    Dependency updates that matter — security fixes, breaking changes in upstream
    libraries — deserve the same attention as any other code change. They should be
    reviewed, understood, and tested. Automating the creation of the change does not
    automate the understanding of it.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Staying current without the noise</h2>

  <p>
    The fear behind dependency automation is "if we do not automate, we will fall behind."
    This is true for teams that ignore their dependencies. It is not true for teams that
    treat dependency management as part of their regular work.
  </p>

  <p>
    The team report makes this visible. If dependencies are drifting, the report shows it.
    If a critical CVE is unpatched, the report flags it. The information is there. The
    team acts on it in their own cadence — weekly, biweekly, whatever works for them.
    The result is fewer, more intentional updates instead of a firehose of automated PRs
    that nobody reviews carefully.
  </p>
</Article>
