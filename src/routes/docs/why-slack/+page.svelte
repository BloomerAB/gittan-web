<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Why we integrate with Slack and not Microsoft Teams"
  subtitle="Everything about Teams is a project. We chose not to start one."
>
  <p>
    gittan sends notifications to your team's chat when pipelines pass, fail, or when
    the org changelog is updated. We integrate with Slack. We do not integrate with
    Microsoft Teams. This is not because we have not been asked — it is the most
    requested integration we do not have. We looked at what it would take to build it,
    and decided not to start.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The Slack integration</h2>

  <p>
    Slack has a webhook API. You create an incoming webhook, you get a URL, you POST
    JSON to it, and a message appears in a channel. It takes five minutes to set up.
    The API is well-documented, stable, and does what you expect. Formatting works.
    Threading works. Link previews work.
  </p>

  <p>
    When we built the Slack integration, it took a day. Most of that was deciding what
    the messages should look like. The API itself was not the problem. That is how an
    integration API should work.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The Teams problem</h2>

  <p>
    Microsoft Teams does not have incoming webhooks in any stable, reliable form. The
    original Office 365 Connectors were deprecated. The replacement is Power Automate
    workflows, which require a Microsoft 365 license, an Azure AD app registration,
    and a flow that triggers on an HTTP request and posts to a channel.
  </p>

  <p>
    To send a message to a Teams channel from an external service, you need: an Azure AD
    tenant, an app registration with the correct Graph API permissions, admin consent for
    those permissions, a service account or certificate for authentication, and knowledge
    of which team ID and channel ID to post to. The authentication alone involves OAuth2
    client credentials flow against the Microsoft identity platform, token caching, and
    handling token refresh.
  </p>

  <p>
    This is not an integration. This is a project.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The maintenance cost</h2>

  <p>
    An integration is not done when it ships. It is done when it stays working. Slack's
    webhook API has been stable for years. The same URL, the same payload format, the
    same behavior. We have not touched the Slack integration code since we wrote it.
  </p>

  <p>
    Microsoft changes their APIs, deprecates features, and moves authentication
    requirements regularly. The Office 365 Connectors deprecation broke integrations
    across the industry. Teams that had working webhook URLs woke up to silent failures.
    The migration path was not "change one URL" — it was "rebuild the integration using
    a completely different authentication model."
  </p>

  <p>
    We are a small team. Every hour we spend maintaining a fragile integration is an hour
    we do not spend on pipelines, policies, or features that make teams ship faster. The
    maintenance cost of a Teams integration is not proportional to the value it provides.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">What Teams users can do</h2>

  <p>
    gittan has a webhook API. When a pipeline completes or a changelog entry is added,
    we can POST a JSON payload to any URL you configure. If your organization requires
    Teams, you can point this webhook at a Power Automate flow, an Azure Function, or
    any middleware that bridges HTTP webhooks to the Teams Graph API.
  </p>

  <p>
    This is not ideal. It requires your team to maintain the bridge. But it is honest.
    We would rather give you a reliable generic webhook than a Teams integration that
    breaks every time Microsoft reorganizes their platform.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Choosing our battles</h2>

  <p>
    Every integration we ship is one we commit to maintaining. We would rather have one
    chat integration that works perfectly than three that work intermittently. Slack's API
    respects developers. Teams' API respects the Microsoft licensing model. We chose the
    one that lets us ship a reliable product.
  </p>

  <p>
    If Microsoft ships a stable, simple webhook API for Teams — a URL you can POST to
    without an Azure AD app registration — we will build the integration the same week.
    Until then, we integrate with Slack.
  </p>
</Article>
