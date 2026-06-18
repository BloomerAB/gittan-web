<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Why gittan is SaaS only"
  subtitle="Shared infrastructure, many moving parts, and a deliberate choice."
>
  <p>
    We get asked about self-hosting regularly. The answer is no. Not because it is
    technically impossible, but because it is not how this product works best — for you
    or for us.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Shared infrastructure is cheaper</h2>

  <p>
    gittan's pipeline speed depends on warm runners and pre-pulled images. Runner pods
    are standing by before you push. Common base images are cached on every node. This
    infrastructure is expensive to run — and it is economical because hundreds of
    customers share it.
  </p>

  <p>
    When a runner finishes your pipeline, it is immediately available for another
    customer's push. When we pre-pull an image, every customer that uses it benefits.
    Node scaling handles bursty workloads across all customers, not just one. The
    utilization is high because the load is diverse.
  </p>

  <p>
    A self-hosted gittan would need the same infrastructure, but serving only your
    organization. You would pay for warm runners that sit idle most of the day. You
    would pay for pre-pulled images that only your team uses. The economics do not
    work unless you are running pipelines at a scale where you would be better served
    by a dedicated conversation with us about your needs.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Many moving parts</h2>

  <p>
    gittan is not a single application you install. It is a distributed system:
    Forgejo for git storage, ScyllaDB for data, NATS for messaging, a runner fleet
    for pipeline execution, a DAG executor for step orchestration, an API server, and
    a web dashboard. These components need to be deployed, monitored, upgraded, and
    scaled — together.
  </p>

  <p>
    We could package this in a Helm chart. But installing it is not the same as
    operating it. When ScyllaDB needs compaction tuning, when NATS hits a slow
    consumer, when the runner fleet needs rebalancing after a node failure — that is
    operational knowledge specific to this system. Your platform team would have to
    learn it. Ours already knows it.
  </p>

  <p>
    Self-hosting a distributed system means your organization takes on the operational
    burden of a system they did not build. Some organizations want that control. For
    most, it is overhead that distracts from the thing they actually want: fast, reliable
    CI.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">It is our service</h2>

  <p>
    We built gittan. We operate it. We are responsible for its uptime, its performance,
    and its reliability. That is the deal. You pay us to run it well so that you can
    focus on your software instead of your tools.
  </p>

  <p>
    This is a deliberate choice, not a limitation. We want to know exactly what
    every customer is running. When we ship an update, it reaches everyone. When we
    find a bug, we fix it once. When we optimize pipeline scheduling, every customer
    gets faster. There is no version fragmentation, no "works on the latest release
    but you are three versions behind."
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Data residency</h2>

  <p>
    The most legitimate reason for self-hosting is data residency. gittan runs in EU
    infrastructure. Your source code, pipeline logs, and metadata stay in the EU. If
    you need a specific region or dedicated tenancy, we are open to that conversation —
    but it is still our infrastructure, managed by us.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">If you need self-hosted git</h2>

  <p>
    If your organization requires self-hosted git hosting, Forgejo is excellent. We run
    it under the hood ourselves — we know it is good software. What it does not have is
    gated push with fast pipelines, cascade testing, DORA metrics, or team-level reports.
    Those are the things gittan adds, and they work best on infrastructure we operate.
  </p>
</Article>
