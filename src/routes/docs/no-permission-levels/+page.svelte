<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Two permission levels: read everything, own your team"
  subtitle="You are either in the team or you are not. There is no in-between."
>
  <p>
    GitHub has five repository permission levels: read, triage, write, maintain, and admin.
    GitLab has five too: guest, reporter, developer, maintainer, and owner. Bitbucket has
    its own set. Every platform has a matrix of roles, and every organization spends time
    deciding who gets which level on which repo.
  </p>

  <p>
    Gittan has two: org member and team member. Org members can read everything. Team
    members are admins of their team's repos. That is it. There is no write-without-admin.
    No read-only team member. No maintainer-but-not-owner. You are in the team, or you
    are not.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Why granular permissions fail</h2>

  <p>
    Granular permissions exist because someone once asked "what if we want to give this
    person write access but not let them change settings?" That sounds reasonable in
    isolation. In practice, it creates a permission management problem that grows with
    every person and every repo.
  </p>

  <p>
    A team of 8 people across 12 repos with 5 permission levels is 480 possible
    configurations. Someone has to decide each one. Someone has to maintain them when
    people join, leave, or change roles. Someone has to audit them quarterly to make sure
    the contractor who left in March does not still have write access to the payments
    service.
  </p>

  <p>
    The complexity is not proportional to the value. Most teams end up giving everyone
    the same level anyway — usually write or maintainer — because managing fine-grained
    access is too much work. The granularity exists in the tool but not in practice.
    It is complexity that serves nobody.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Everyone reads everything</h2>

  <p>
    Every member of your Gittan org can read every repo in the org. There is no private
    repo that only one team can see. There is no hidden service that requires a special
    access request.
  </p>

  <p>
    This is deliberate. Engineers need to read code they do not own. A frontend developer
    debugging an API response needs to read the backend code. A platform engineer writing
    a policy needs to understand what the teams are running. A new hire onboarding needs
    to explore the codebase without filing access requests for every repo they encounter.
  </p>

  <p>
    Restricting read access within an organization is almost always a political decision,
    not a security decision. The people in your org are already trusted — they passed
    your hiring process, they signed your NDA, they are authenticated through your IdP.
    Hiding code from them does not make it safer. It makes collaboration harder.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Team members are admins</h2>

  <p>
    If you are a member of a team, you have full admin access to that team's repos. You
    can push code, change pipeline config, update settings, add repos, and manage the
    team. There is no reduced-access team membership.
  </p>

  <p>
    This follows directly from team ownership. If the team owns the service, every team
    member must be able to do everything the service needs. A developer who can push code
    but cannot update the pipeline config is blocked the moment CI needs a change. A team
    member who cannot adjust repo settings has to ask someone else to do it — adding a
    bottleneck for no reason.
  </p>

  <p>
    "But what if someone on the team breaks something?" Then the team fixes it. That is
    what ownership means. If you do not trust someone to have admin access, the question
    is not what permission level to give them — the question is whether they should be on
    the team.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Onboarding is an AD group</h2>

  <p>
    We recommend mapping Gittan teams to groups in your identity provider — Azure AD,
    Google Workspace, Okta, whatever you use. When a new developer joins, your IT team
    adds them to the right AD group. That is it. Next time they log in to Gittan, they
    are on the team, with full access to everything the team owns.
  </p>

  <p>
    Offboarding is the same. Remove them from the AD group, access is revoked. No
    Gittan admin needs to do anything. No access review. No "can someone remove this
    person from the 14 repos they had access to." The identity provider is the source
    of truth, and Gittan follows it.
  </p>

  <p>
    You can also manage team membership manually in Gittan if your organization does not
    use group claims. But for any team larger than a handful of people, IdP-driven
    membership eliminates an entire category of onboarding and offboarding tasks. One
    group change, all access updated. That is how it should work.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Including non-engineers</h2>

  <p>
    Product owners, designers, QA — if they are on the team, they are admins. This sounds
    radical until you think about what admin access actually means in Gittan. There are no
    issues to misconfigure, no wiki to accidentally delete, no marketplace apps to install.
    Admin means: push code, manage pipelines, update settings. If a PO is added to the
    team and pushes bad code, the pipeline rejects it. The gated push is the safety net,
    not the permission model.
  </p>

  <p>
    And if someone on the team does something the rest of the team disagrees with, that
    is a team conversation — not a permission problem. Restricting access to prevent
    mistakes is a substitute for trust. We optimize for trust.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The permission model is the culture</h2>

  <p>
    Every permission level you add is a statement about trust. Read-only says "we do not
    trust you to change things." Write-without-admin says "we trust you with code but not
    with configuration." Maintainer-but-not-owner says "we trust you with most things but
    not all things."
  </p>

  <p>
    Gittan's model says: if you are on the team, we trust you fully. If we do not trust
    you fully, you should not be on the team. There is no permission level that
    communicates "sort of trusted." That ambiguity helps no one.
  </p>

  <p>
    This is not naive. It is the same principle that the DORA research validates:
    high-trust environments produce better software. Trust is not a feel-good policy —
    it is a performance strategy. The permission model should reflect that.
  </p>
</Article>
