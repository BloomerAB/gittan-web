<script lang="ts">
  type TAuditEvent = {
    id: string
    actorEmail: string
    action: string
    resourceType: string
    resourceId: string
    detail: string
    createdAt: string
  }

  let { data } = $props()

  const auditEvents: TAuditEvent[] = data.auditEvents ?? []

  function formatTime(ts: string): string {
    const d = new Date(ts)
    return d.toLocaleString('en-SE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function actionColor(action: string): string {
    if (action.startsWith('team.') || action.startsWith('repo.')) return 'text-accent-400'
    if (action.startsWith('policy.') || action.startsWith('step.')) return 'text-policy-400'
    if (action.startsWith('member.')) return 'text-ok-400'
    if (action.startsWith('auth.') || action.startsWith('settings.')) return 'text-surface-400'
    return 'text-surface-400'
  }
</script>

<div class="p-6">
  <h2 class="text-lg font-semibold text-surface-200 mb-6">Audit Log</h2>

  {#if auditEvents.length === 0}
    <p class="text-sm text-surface-500">No audit events found.</p>
  {:else}
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-surface-800 text-left">
            <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2 pr-4">Time</th>
            <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2 pr-4">Actor</th>
            <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2 pr-4">Action</th>
            <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2 pr-4">Resource</th>
            <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2">Detail</th>
          </tr>
        </thead>
        <tbody>
          {#each auditEvents as event (event.id)}
            <tr class="border-b border-surface-800/50">
              <td class="py-2.5 pr-4 text-surface-500 whitespace-nowrap">{formatTime(event.createdAt)}</td>
              <td class="py-2.5 pr-4 text-surface-400">{event.actorEmail}</td>
              <td class="py-2.5 pr-4 font-mono {actionColor(event.action)}">{event.action}</td>
              <td class="py-2.5 pr-4 text-surface-500 font-mono text-xs whitespace-nowrap">
                {#if event.resourceType}
                  <span class="text-surface-400">{event.resourceType}</span>
                  {#if event.resourceId}
                    <span class="text-surface-600">/{event.resourceId}</span>
                  {/if}
                {/if}
              </td>
              <td class="py-2.5 text-surface-400">{event.detail}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
