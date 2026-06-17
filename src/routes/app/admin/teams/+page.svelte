<script lang="ts">
  let { data } = $props()

  let selectedTeamId = $state<string | null>(null)
  let showCreateForm = $state(false)

  let newTeamName = $state('')
  let newTeamDisplayName = $state('')

  let editDisplayName = $state('')
  let editSlackChannel = $state('')
  let editOidcGroupId = $state('')
  let editOidcRole = $state<'admin' | 'member'>('member')

  let addMemberEmail = $state('')
  let addMemberRole = $state<'admin' | 'member'>('member')

  type TMember = {
    email: string
    role: 'admin' | 'member'
  }

  type TOidcMapping = {
    groupId: string
    role: 'admin' | 'member'
  }

  let mockMembers = $state<Record<string, TMember[]>>({})
  let mockOidcMappings = $state<Record<string, TOidcMapping[]>>({})

  let selectedTeam = $derived(data.teams.find((t: any) => t.id === selectedTeamId))

  function selectTeam(teamId: string) {
    const team = data.teams.find((t: any) => t.id === teamId)
    if (!team) return
    selectedTeamId = teamId
    editDisplayName = team.displayName
    editSlackChannel = team.slackChannel ?? ''
    editOidcGroupId = ''
    editOidcRole = 'member'
    addMemberEmail = ''
    addMemberRole = 'member'
  }

  function addOidcMapping() {
    if (!editOidcGroupId || !selectedTeamId) return
    const existing = mockOidcMappings[selectedTeamId] ?? []
    mockOidcMappings = {
      ...mockOidcMappings,
      [selectedTeamId]: [...existing, { groupId: editOidcGroupId, role: editOidcRole }],
    }
    editOidcGroupId = ''
    editOidcRole = 'member'
  }

  function addMember() {
    if (!addMemberEmail || !selectedTeamId) return
    const existing = mockMembers[selectedTeamId] ?? []
    mockMembers = {
      ...mockMembers,
      [selectedTeamId]: [...existing, { email: addMemberEmail, role: addMemberRole }],
    }
    addMemberEmail = ''
    addMemberRole = 'member'
  }

  function removeMember(email: string) {
    if (!selectedTeamId) return
    const existing = mockMembers[selectedTeamId] ?? []
    mockMembers = {
      ...mockMembers,
      [selectedTeamId]: existing.filter((m) => m.email !== email),
    }
  }

  function removeOidcMapping(groupId: string) {
    if (!selectedTeamId) return
    const existing = mockOidcMappings[selectedTeamId] ?? []
    mockOidcMappings = {
      ...mockOidcMappings,
      [selectedTeamId]: existing.filter((m) => m.groupId !== groupId),
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

<div class="p-6">
  {#if selectedTeam}
    <div>
      <button
        onclick={() => { selectedTeamId = null }}
        class="text-sm text-surface-500 hover:text-surface-300 mb-4 transition-colors"
      >
        &larr; Back to teams
      </button>

      <h2 class="text-lg font-semibold text-surface-200 mb-6">{selectedTeam.name}</h2>

      <div class="space-y-6 max-w-xl">
        <div>
          <label class="block text-xs text-surface-500 mb-1">Display Name</label>
          <input
            type="text"
            bind:value={editDisplayName}
            class="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-xs text-surface-500 mb-1">Slack Channel</label>
          <input
            type="text"
            bind:value={editSlackChannel}
            placeholder="#team-channel"
            class="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
          />
        </div>

        <div>
          <h3 class="text-sm text-surface-400 mb-3">OIDC Group Mapping</h3>
          {#if (mockOidcMappings[selectedTeamId ?? ''] ?? []).length > 0}
            <div class="space-y-2 mb-3">
              {#each mockOidcMappings[selectedTeamId ?? ''] ?? [] as mapping}
                <div class="flex items-center gap-2 text-sm">
                  <span class="font-mono text-surface-300 flex-1">{mapping.groupId}</span>
                  <span class="text-surface-500">{mapping.role}</span>
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
              placeholder="Group ID"
              class="flex-1 bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
            />
            <select
              bind:value={editOidcRole}
              class="bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
            >
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>
            <button
              onclick={addOidcMapping}
              class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <h3 class="text-sm text-surface-400 mb-3">Members</h3>
          {#if (mockMembers[selectedTeamId ?? ''] ?? []).length > 0}
            <div class="space-y-2 mb-3">
              {#each mockMembers[selectedTeamId ?? ''] ?? [] as member}
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-surface-300 flex-1">{member.email}</span>
                  <select
                    value={member.role}
                    onchange={(e) => {
                      if (!selectedTeamId) return
                      const existing = mockMembers[selectedTeamId] ?? []
                      mockMembers = {
                        ...mockMembers,
                        [selectedTeamId]: existing.map((m) =>
                          m.email === member.email
                            ? { ...m, role: (e.target as HTMLSelectElement).value as 'admin' | 'member' }
                            : m,
                        ),
                      }
                    }}
                    class="bg-surface-900 border border-surface-800 rounded-md px-2 py-1 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
                  >
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                  </select>
                  <button
                    onclick={() => removeMember(member.email)}
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
              type="email"
              bind:value={addMemberEmail}
              placeholder="user@example.com"
              class="flex-1 bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
            />
            <select
              bind:value={addMemberRole}
              class="bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
            >
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>
            <button
              onclick={addMember}
              class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <button class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors">
          Save Team
        </button>
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
      <div class="bg-surface-900 border border-surface-800 rounded-lg p-4 mb-6 max-w-xl">
        <div class="space-y-3">
          <div>
            <label class="block text-xs text-surface-500 mb-1">Team Name</label>
            <input
              type="text"
              bind:value={newTeamName}
              placeholder="backend"
              class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono"
            />
          </div>
          <div>
            <label class="block text-xs text-surface-500 mb-1">Display Name</label>
            <input
              type="text"
              bind:value={newTeamDisplayName}
              placeholder="Backend Team"
              class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
            />
          </div>
          <button class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors">
            Create
          </button>
        </div>
      </div>
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
              <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2 pr-4">Display Name</th>
              <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2 pr-4">Slack</th>
              <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {#each data.teams as team}
              <tr
                class="border-b border-surface-800/50 hover:bg-surface-900 cursor-pointer transition-colors"
                onclick={() => selectTeam(team.id)}
              >
                <td class="py-2.5 pr-4 font-mono text-surface-300">{team.name}</td>
                <td class="py-2.5 pr-4 text-surface-400">{team.displayName}</td>
                <td class="py-2.5 pr-4 text-surface-500">{team.slackChannel ?? '-'}</td>
                <td class="py-2.5 text-surface-500">{formatDate(team.createdAt)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/if}
</div>
