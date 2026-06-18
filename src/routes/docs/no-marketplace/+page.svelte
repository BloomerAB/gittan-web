<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Your CI should not run third-party code"
  subtitle="Marketplace actions are a supply chain risk you do not need."
>
  <p>
    GitHub Actions has a marketplace with thousands of community-built actions. Need to
    deploy to AWS? There is an action. Need to send a Slack notification? There is an action.
    Need to lint your code? There is an action. This is convenient. It is also a security
    problem that most teams underestimate.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The supply chain problem</h2>

  <p>
    When you add <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">uses: some-org/some-action@v3</code>
    to your workflow, you are running code written by someone you do not know, with full
    access to your repository's secrets, source code, and CI environment. The action can
    read your deploy keys. It can exfiltrate environment variables. It can modify the code
    being built.
  </p>

  <p>
    In January 2024, a widely-used GitHub Action was compromised, leaking CI/CD secrets
    from repositories that used it. This was not a theoretical risk — it happened, and it
    affected real organizations. The attack surface is every third-party action in every
    workflow in every repository.
  </p>

  <p>
    Pinning to a commit SHA instead of a tag helps, but it does not eliminate the risk. You
    are still running code you did not write, and most teams do not audit the source of
    every action they use.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">How gittan pipelines work</h2>

  <p>
    gittan pipelines use container images. Each step runs in a container that you specify
    by image and tag. There is no marketplace, no shared actions, no community plugins.
  </p>

  <p>
    This sounds limiting until you realize that a container image is more powerful than an
    action. An action runs in a predefined runtime with predefined inputs and outputs. A
    container image runs whatever you put in it — any language, any tool, any version. And
    because it is a container, you can scan it, sign it, test it, and pin it to an exact
    digest.
  </p>

  <p>
    Your org policy can enforce which image registries are allowed. If your security team
    requires that all CI images come from your internal registry, that is a one-line policy.
    No action can circumvent it because there are no actions — only images.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Reuse without risk</h2>

  <p>
    Teams still share CI logic. The mechanism is team templates — a set of pipeline steps
    that apply to every repo in a team. If your backend team uses the same lint, test, and
    build steps across 20 repos, that is one template, not 20 copy-pasted workflow files.
  </p>

  <p>
    The difference is that the template is owned by your team, stored in your org, and
    governed by your policies. It is not a third-party dependency you hope stays maintained
    and uncompromised.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Less magic, more control</h2>

  <p>
    Marketplace ecosystems optimize for convenience. gittan optimizes for control. We believe
    that in CI — where your code is built, your secrets are present, and your artifacts are
    produced — control matters more than convenience. If a step in your pipeline does something
    unexpected, you should be able to inspect the image, read the Dockerfile, and understand
    exactly what ran. That is harder to do with a third-party action that wraps a Node.js
    script you never read.
  </p>
</Article>
