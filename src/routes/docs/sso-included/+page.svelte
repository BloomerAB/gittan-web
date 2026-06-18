<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="SSO is a security feature, not a premium add-on"
  subtitle="Gating SSO behind enterprise tiers forces small teams into weaker authentication."
>
  <p>
    Every major git hosting platform charges extra for SSO. GitHub requires Enterprise.
    GitLab requires Premium or above. Bitbucket requires a separate Atlassian Access
    subscription. The message is clear: single sign-on is a luxury for organizations that
    can afford it.
  </p>

  <p>
    This is backwards.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The SSO tax</h2>

  <p>
    The industry calls it the "SSO tax" — the surcharge for connecting your identity
    provider to a SaaS product. The justification is that SSO is an enterprise feature
    because enterprises are the ones who need it. But that reasoning confuses who asks
    for SSO with who benefits from it.
  </p>

  <p>
    A 5-person startup benefits from SSO just as much as a 5,000-person corporation. When
    someone leaves the team, disabling their identity provider account revokes access to
    every connected service. Without SSO, you have to remember every service they had
    a password for and disable each one manually. You will miss some.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">What happens without SSO</h2>

  <p>
    Teams on lower-tier plans use passwords. Passwords get reused. Passwords get shared
    in Slack. Passwords do not get rotated. When someone leaves, their password still
    works until someone remembers to change it.
  </p>

  <p>
    Two-factor authentication helps, but it is a mitigation for a problem that SSO solves
    at the root. Your identity provider handles authentication, MFA, session management,
    and deprovisioning in one place. Passwords handled per-service spread that
    responsibility across every service and every user.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Our approach</h2>

  <p>
    Every Gittan plan includes OIDC. Connect your identity provider on day one. We
    support any standard OpenID Connect provider: Azure AD, Google Workspace, Okta,
    Keycloak, Auth0 — anything that speaks OIDC.
  </p>

  <p>
    Team membership is derived from your identity provider's groups claim. When someone
    joins a team in your IdP, they get access to that team's repos in Gittan. When they
    leave, access is revoked. No manual user management. No SCIM provisioning. Your org
    chart is your access model.
  </p>

  <p>
    We do not offer password-based authentication at all. There is no "local accounts"
    option. This is a deliberate constraint. It means every Gittan user is authenticated
    through a real identity provider, which means every access event is auditable through
    your IdP's logs.
  </p>

  <p>
    SSO is not a feature we sell. It is a security baseline we enforce.
  </p>
</Article>
