<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Why we ban the latest tag"
  subtitle="Every image in a gittan pipeline has a timestamp and a commit SHA. No exceptions."
>
  <p>
    The <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">latest</code>
    tag is the most dangerous default in container tooling. It means "whatever was pushed
    most recently," which means your pipeline ran a different image today than it did
    yesterday, and you have no way of knowing unless you checked the digest. Most teams
    do not check the digest.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The reproducibility problem</h2>

  <p>
    A pipeline should produce the same result given the same input. If your pipeline step
    uses <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">node:22</code>,
    that tag can point to a different image digest every week. Node publishes patch releases,
    the tag moves, and suddenly your build breaks — not because your code changed, but
    because the runtime changed under you.
  </p>

  <p>
    Debugging this is miserable. The build passed yesterday. Nothing in the repo changed.
    The build fails today. You spend an hour before someone realizes that
    <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">node:22</code>
    now points to 22.14.0 instead of 22.13.1, and the new version changed the behavior of
    a flag your build script depends on.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">gittan's tag format</h2>

  <p>
    gittan enforces a tag format for all images used in pipelines:
    <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">YYYYMMDD-HHMMSS-sha</code>.
    For example:
    <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">20260615-143022-a1b2c3d</code>.
  </p>

  <p>
    The tag tells you exactly when the image was built and from which commit. It is
    immutable — the same tag always points to the same image. If you need to update, you
    build a new image and get a new tag. There is no ambiguity about what ran.
  </p>

  <p>
    This is enforced at the org policy level. If a pipeline config references
    <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">latest</code>,
    <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">stable</code>,
    or any mutable tag, the push is rejected with a clear error explaining why and what
    format to use instead.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Updating images</h2>

  <p>
    The common objection is that pinned tags create upgrade friction. If every image has
    an explicit tag, someone has to bump it. That is true — and that is the point. An
    image update should be a deliberate decision, not something that happens silently
    in the background.
  </p>

  <p>
    When you bump an image tag, the change shows up in the pipeline config diff. It is
    reviewable. It is revertible. If the new image breaks something, you can see exactly
    when the image changed and roll back to the previous tag. Try doing that with
    <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">latest</code>.
  </p>

  <p>
    gittan's team reports include advisories when pipeline images have known
    vulnerabilities or are significantly outdated. The team sees "your build image is 90
    days old and has 3 known CVEs" and can decide when to update. The update is on their
    terms, not forced by a tag that moved overnight.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Supply chain integrity</h2>

  <p>
    Immutable tags are the foundation of supply chain integrity. If you sign an image at
    tag <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">20260615-143022-a1b2c3d</code>,
    you know exactly what you signed. If you sign
    <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">latest</code>,
    you signed whatever happened to be there at that moment — and it will be something
    different tomorrow.
  </p>

  <p>
    Combined with org policies that enforce image registry sources and image signing,
    the tag format creates a verifiable chain from source commit to running container.
    Every step in the pipeline used a known image, built from a known commit, signed by
    a known key. That is auditable. That is reproducible. And it starts with not using
    <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">latest</code>.
  </p>
</Article>
