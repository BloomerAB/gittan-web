<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'

  let { data, form } = $props()

  let inviteEmail = $state('')
  let inviteRole = $state('member')
  let inviting = $state(false)
  let removingId = $state<string | null>(null)
  let revokingId = $state<string | null>(null)

  const roleLabel = (role: string) => {
    if (role === 'owner') return 'Owner'
    return 'Member'
  }

  const roleBadgeClass = (role: string) => {
    if (role === 'owner') return 'text-accent-400 bg-accent-400/10'
    return 'text-surface-400 bg-surface-800'
  }

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'today'
    if (days === 1) return 'yesterday'
    return `${days}d ago`
  }
</script>

<div>
  <h2 class="text-lg font-semibold text-surface-200 mb-2">Members</h2>
  <p class="text-xs text-surface-600 mb-8">Manage who has access to your organization.</p>

  <div class="max-w-2xl">
    <div class="mb-8">
      <h3 class="text-sm font-medium text-surface-300 mb-3">Invite a new member</h3>
      <form
        method="POST"
        action="?/invite"
        use:enhance={() => {
          inviting = true
          return async ({ result, update }) => {
            inviting = false
            if (result.type === 'success') {
              inviteEmail = ''
              inviteRole = 'member'
              await invalidateAll()
            }
            await update()
          }
        }}
      >
        <div class="flex gap-3">
          <input
            name="email"
            type="email"
            bind:value={inviteEmail}
            placeholder="colleague@company.com"
            required
            class="flex-1 bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono"
          />
          <select
            name="role"
            bind:value={inviteRole}
            class="bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
          >
            <option value="member">Member</option>
            <option value="owner">Owner</option>
          </select>
          <button
            type="submit"
            disabled={inviting || !inviteEmail}
            class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {inviting ? 'Inviting...' : 'Send invite'}
          </button>
        </div>
        {#if form?.invited}
          <p class="text-xs text-ok-400 mt-2">Invite sent.</p>
        {/if}
        {#if form?.error && !form?.revoked && !form?.removed}
          <p class="text-xs text-err-400 mt-2">{form.error}</p>
        {/if}
      </form>
    </div>

    {#if data.invites?.length > 0}
      <div class="mb-8">
        <h3 class="text-sm font-medium text-surface-300 mb-3">Pending invites</h3>
        <div class="border border-surface-800 rounded-md divide-y divide-surface-800">
          {#each data.invites as invite}
            <div class="flex items-center justify-between px-4 py-3">
              <div class="min-w-0">
                <p class="text-sm text-surface-300 truncate font-mono">{invite.email}</p>
                <p class="text-xs text-surface-600">
                  Invited {timeAgo(invite.createdAt)} · expires {new Date(invite.expiresAt).toLocaleDateString()}
                </p>
              </div>
              <div class="flex items-center gap-3 shrink-0 ml-3">
                <span class="text-[11px] px-2 py-0.5 rounded-full {roleBadgeClass(invite.role)}">
                  {roleLabel(invite.role)}
                </span>
                <form
                  method="POST"
                  action="?/revoke"
                  use:enhance={() => {
                    revokingId = invite.id
                    return async ({ update }) => {
                      revokingId = null
                      await update()
                      await invalidateAll()
                    }
                  }}
                >
                  <input type="hidden" name="inviteId" value={invite.id} />
                  <button
                    type="submit"
                    disabled={revokingId === invite.id}
                    class="text-xs text-surface-500 hover:text-err-400 transition-colors"
                  >
                    Revoke
                  </button>
                </form>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <div>
      <h3 class="text-sm font-medium text-surface-300 mb-3">
        Active members
        <span class="text-surface-600 font-normal">({data.members?.length ?? 0})</span>
      </h3>
      {#if data.members?.length}
        <div class="border border-surface-800 rounded-md divide-y divide-surface-800">
          {#each data.members as member}
            <div class="flex items-center justify-between px-4 py-3">
              <div class="min-w-0">
                <p class="text-sm text-surface-200 truncate font-mono">{member.email}</p>
              </div>
              <div class="flex items-center gap-3 shrink-0 ml-3">
                <span class="text-xs text-surface-600">{timeAgo(member.joinedAt)}</span>
                <span class="text-[11px] px-2 py-0.5 rounded-full {roleBadgeClass(member.role)}">
                  {roleLabel(member.role)}
                </span>
                {#if member.role !== 'owner'}
                  <form
                    method="POST"
                    action="?/remove"
                    use:enhance={() => {
                      removingId = member.userId
                      return async ({ update }) => {
                        removingId = null
                        await update()
                        await invalidateAll()
                      }
                    }}
                  >
                    <input type="hidden" name="userId" value={member.userId} />
                    <button
                      type="submit"
                      disabled={removingId === member.userId}
                      class="text-xs text-surface-500 hover:text-err-400 transition-colors"
                    >
                      Remove
                    </button>
                  </form>
                {:else}
                  <span class="w-[52px]"></span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-sm text-surface-500">No members found.</p>
      {/if}
    </div>
  </div>
</div>
