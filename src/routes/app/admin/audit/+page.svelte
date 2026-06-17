<script lang="ts">
  type TAuditEvent = {
    time: string
    actor: string
    action: string
    detail: string
  }

  const events: TAuditEvent[] = [
    { time: '2026-06-17T14:32:00Z', actor: 'mal.nordstrom@gmail.com', action: 'team.create', detail: 'Created team "platform"' },
    { time: '2026-06-17T14:28:00Z', actor: 'mal.nordstrom@gmail.com', action: 'policy.update', detail: 'Updated policy "require-trivy-scan"' },
    { time: '2026-06-17T13:15:00Z', actor: 'anna@example.com', action: 'member.add', detail: 'Added erik@example.com to team "backend"' },
    { time: '2026-06-17T12:44:00Z', actor: 'mal.nordstrom@gmail.com', action: 'repo.create', detail: 'Created repo "api-gateway" in team "platform"' },
    { time: '2026-06-17T11:30:00Z', actor: 'anna@example.com', action: 'auth.oidc', detail: 'Updated OIDC issuer URL' },
    { time: '2026-06-16T16:22:00Z', actor: 'mal.nordstrom@gmail.com', action: 'step.register', detail: 'Registered step "platform/trivy"' },
    { time: '2026-06-16T15:10:00Z', actor: 'erik@example.com', action: 'member.remove', detail: 'Removed old-user@example.com from team "frontend"' },
    { time: '2026-06-16T10:05:00Z', actor: 'mal.nordstrom@gmail.com', action: 'settings.update', detail: 'Disabled public repositories' },
  ]

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

  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-surface-800 text-left">
          <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2 pr-4">Time</th>
          <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2 pr-4">Actor</th>
          <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2 pr-4">Action</th>
          <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2">Detail</th>
        </tr>
      </thead>
      <tbody>
        {#each events as event}
          <tr class="border-b border-surface-800/50">
            <td class="py-2.5 pr-4 text-surface-500 whitespace-nowrap">{formatTime(event.time)}</td>
            <td class="py-2.5 pr-4 text-surface-400">{event.actor}</td>
            <td class="py-2.5 pr-4 font-mono {actionColor(event.action)}">{event.action}</td>
            <td class="py-2.5 text-surface-400">{event.detail}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
