<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'
  import type { TTeamMember } from '$lib/types'
  import UserSearch from '$lib/components/UserSearch.svelte'

  let { data, form } = $props()

  let selectedTeamId = $state<string | null>(null)
  let showCreateForm = $state(false)
  let creating = $state(false)
  let saving = $state(false)
  let saveError = $state('')

  let editDisplayName = $state('')
  let editSlackChannel = $state('')
  let editOidcGroupId = $state('')

  let addMemberError = $state('')
  let addMemberLoading = $state(false)

  type TOidcMapping = {
    groupId: string
  }

  let members = $state<TTeamMember[]>([])
  let membersLoading = $state(false)
  let membersError = $state('')

  let oidcMappings = $state<TOidcMapping[]>([])

  let selectedTeam = $derived(data.teams.find((t: { id: string }) => t.id === selectedTeamId))

  async function fetchMembers(teamId: string): Promise<void> {
    membersLoading = true
    membersError = ''
    try {
      const res = await fetch(`/app/admin/teams/members?teamId=${encodeURIComponent(teamId)}`)
      if (!res.ok) throw new Error(`Failed to load members: ${res.status}`)
      members = (await res.json()) as TTeamMember[]
    } catch (err) {
      membersError = err instanceof Error ? err.message : 'Failed to load members'
      members = []
    } finally {
      membersLoading = false
    }
  }

  function selectTeam(teamId: string) {
    const team = data.teams.find((t: { id: string }) => t.id === teamId)
    if (!team) return
    selectedTeamId = teamId
    editDisplayName = team.displayName
    editSlackChannel = team.slackChannel ?? ''
    editOidcGroupId = ''
    addMemberError = ''
    oidcMappings = []
    void fetchMembers(teamId)
  }

  function addOidcMapping() {
    if (!editOidcGroupId) return
    oidcMappings = [...oidcMappings, { groupId: editOidcGroupId }]
    editOidcGroupId = ''
  }

  function removeOidcMapping(groupId: string) {
    oidcMappings = oidcMappings.filter((m) => m.groupId !== groupId)
  }

  async function addMemberById(user: { id: string; email: string; name: string }) {
    if (!selectedTeamId) return
    addMemberLoading = true
    addMemberError = ''
    try {
      const res = await fetch('/app/admin/teams/members/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: selectedTeamId, userId: user.id }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { message?: string }).message ?? `Failed to add member: ${res.status}`)
      }
      await fetchMembers(selectedTeamId)
    } catch (err) {
      addMemberError = err instanceof Error ? err.message : 'Failed to add member'
    } finally {
      addMemberLoading = false
    }
  }

  async function removeMember(userId: string) {
    if (!selectedTeamId) return
    try {
      const res = await fetch('/app/admin/teams/members/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: selectedTeamId, userId }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { message?: string }).message ?? `Failed to remove member: ${res.status}`)
      }
      await fetchMembers(selectedTeamId)
    } catch (err) {
      membersError = err instanceof Error ? err.message : 'Failed to remove member'
    }
  }

  function formatDate(ts: string): string {
    return new Date(ts).toLocaleDateString('en-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
</script>

<div>
  {#if selectedTeam}
    <div>
      <button
        onclick={() => { selectedTeamId = null }}
        class="text-sm text-surface-500 hover:text-surface-300 mb-4 transition-colors"
      >
        &larr; Back to teams
      </button>

      <h2 class="text-lg font-semibold text-surface-200 mb-6">{selectedTeam.displayName}</h2>

      <div class="space-y-6 max-w-xl">
        <form
          method="POST"
          action="?/updateTeam"
          use:enhance={() => {
            saving = true
            saveError = ''
            return async ({ result }) => {
              saving = false
              if (result.type === 'failure') {
                saveError = (result.data as { error?: string })?.error ?? 'Failed to save'
              } else {
                saveError = ''
                await invalidateAll()
                if (selectedTeamId) selectTeam(selectedTeamId)
              }
            }
          }}
          class="space-y-4"
        >
          <input type="hidden" name="teamId" value={selectedTeam.id} />

          <div>
            <label for="edit-displayName" class="block text-xs text-surface-500 mb-1">Display Name</label>
            <input
              id="edit-displayName"
              type="text"
              name="displayName"
              bind:value={editDisplayName}
              class="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
            />
          </div>

          <div>
            <label for="edit-slackChannel" class="block text-xs text-surface-500 mb-1">Slack Channel</label>
            <input
              id="edit-slackChannel"
              type="text"
              name="slackChannel"
              bind:value={editSlackChannel}
              placeholder="#team-channel"
              class="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
            />
            <p class="text-[10px] text-surface-600 mt-1">Requires <a href="/app/admin/integrations" class="text-accent-400 hover:text-accent-300">Slack integration</a></p>
          </div>

          {#if saveError}
            <p class="text-xs text-err-400">{saveError}</p>
          {/if}
          {#if form?.updated}
            <p class="text-xs text-ok-400">Team saved.</p>
          {/if}

          <button
            type="submit"
            disabled={saving}
            class="bg-accent-600 hover:bg-accent-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors"
          >
            {saving ? 'Saving...' : 'Save Team'}
          </button>
        </form>

        <div>
          <h3 class="text-sm text-surface-400 mb-3">OIDC Group Mapping</h3>
          {#if oidcMappings.length > 0}
            <div class="space-y-2 mb-3">
              {#each oidcMappings as mapping}
                <div class="flex items-center gap-2 text-sm">
                  <span class="font-mono text-surface-300 flex-1">{mapping.groupId}</span>
                  <button
                    onclick={() => removeOidcMapping(mapping.groupId)}
                    class="text-err-400 hover:text-err-300 text-xs transition-colors"
                  >
                    remove
                  </button>
                </div>
              {/each}
            </div>
          {/if}
          <div class="flex gap-2">
            <input
              type="text"
              bind:value={editOidcGroupId}
              placeholder="AD Group ID"
              class="flex-1 bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
            />
            <button
              onclick={addOidcMapping}
              class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors"
            >
              Add
            </button>
          </div>
          <p class="text-[10px] text-surface-600 mt-2">Maps AD/OIDC groups to this team -- API coming soon</p>
        </div>

        <div>
          <h3 class="text-sm text-surface-400 mb-3">Members</h3>
          <p class="text-[10px] text-surface-600 mb-3">All team members have full admin access. Team ownership = responsibility.</p>

          {#if membersError}
            <p class="text-xs text-err-400 mb-2">{membersError}</p>
          {/if}

          {#if membersLoading}
            <p class="text-xs text-surface-500 mb-3">Loading...</p>
          {:else if members.length > 0}
            <div class="space-y-2 mb-3">
              {#each members as member}
                <div class="flex items-center gap-2 text-sm">
                  <span class="font-mono text-surface-300 flex-1 text-xs">{member.email ?? member.userId}</span>
                  <span class="text-surface-600 text-xs">{formatDate(member.addedAt)}</span>
                  <button
                    onclick={() => removeMember(member.userId)}
                    class="text-err-400 hover:text-err-300 text-xs transition-colors"
                  >
                    remove
                  </button>
                </div>
              {/each}
            </div>
          {/if}

          {#if addMemberError}
            <p class="text-xs text-err-400 mb-2">{addMemberError}</p>
          {/if}

          <UserSearch
            onSelect={addMemberById}
            disabled={addMemberLoading}
            excludeUserIds={members.map((m) => m.userId)}
          />
        </div>
      </div>
    </div>
  {:else}
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-surface-200">Teams</h2>
      <button
        onclick={() => { showCreateForm = !showCreateForm }}
        class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors"
      >
        {showCreateForm ? 'Cancel' : 'Create Team'}
      </button>
    </div>

    {#if showCreateForm}
      <form
        method="POST"
        action="?/create"
        use:enhance={() => {
          creating = true
          return async ({ result, update }) => {
            creating = false
            await update()
            if (result.type === 'success') {
              await invalidateAll()
              showCreateForm = false
            }
          }
        }}
        class="bg-surface-900 border border-surface-800 rounded-lg p-4 mb-6 max-w-xl"
      >
        {#if form?.error}
          <div class="text-err-400 text-xs mb-3 px-3 py-2 bg-err-400/10 border border-err-400/20 rounded">
            {form.error}
          </div>
        {/if}
        <div class="space-y-3">
          <div>
            <label for="team-display" class="block text-xs text-surface-500 mb-1">Team Name</label>
            <input
              id="team-display"
              type="text"
              name="displayName"
              required
              placeholder="Checkout Flow"
              class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
            />
          </div>
          <div>
            <label for="team-slack" class="block text-xs text-surface-500 mb-1">Slack Channel</label>
            <input
              id="team-slack"
              type="text"
              name="slackChannel"
              placeholder="#team-channel"
              class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
            />
            <p class="text-[11px] text-surface-600 mt-1">Pipeline notifications are sent here (requires Slack integration)</p>
          </div>
          <button
            type="submit"
            disabled={creating}
            class="bg-accent-600 hover:bg-accent-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    {/if}

    {#if data.teams.length === 0}
      <div class="py-12 text-center">
        <p class="text-sm text-surface-500">No teams yet</p>
        <p class="text-xs text-surface-600 mt-2">Create your first team to get started</p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-800 text-left">
              <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2 pr-4">Name</th>
              <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2 pr-4">Slack</th>
              <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2 pr-4">Members</th>
              <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {#each data.teams as team}
              <tr
                class="border-b border-surface-800/50 hover:bg-surface-900 cursor-pointer transition-colors"
                onclick={() => selectTeam(team.id)}
              >
                <td class="py-2.5 pr-4 text-surface-300">{team.displayName}</td>
                <td class="py-2.5 pr-4 text-surface-500">{team.slackChannel ?? '-'}</td>
                <td class="py-2.5 pr-4 text-surface-500">{team.memberCount ?? '-'}</td>
                <td class="py-2.5 text-surface-500">{formatDate(team.createdAt)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/if}
</div>
