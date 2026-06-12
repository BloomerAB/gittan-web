export function AdminAudit() {
  const mockEvents = [
    { time: "2026-06-12 14:39", actor: "malin", action: "created team", detail: "Platform Team" },
    { time: "2026-06-12 14:39", actor: "malin", action: "created team", detail: "API Team" },
    { time: "2026-06-12 14:39", actor: "malin", action: "created repo", detail: "gittan-api in Platform Team" },
    { time: "2026-06-12 14:39", actor: "malin", action: "created repo", detail: "gittan-runner in Platform Team" },
    { time: "2026-06-12 14:39", actor: "malin", action: "created repo", detail: "gittan-types in Platform Team" },
    { time: "2026-06-12 14:39", actor: "malin", action: "created repo", detail: "api-gateway in API Team" },
    { time: "2026-06-12 14:39", actor: "malin", action: "created repo", detail: "api-users in API Team" },
    { time: "2026-06-12 14:39", actor: "malin", action: "created repo", detail: "api-billing in API Team" },
  ]

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Audit Log</h2>

      <div className="bg-surface-900 border border-surface-800 rounded-md overflow-hidden">
        {mockEvents.map((event, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 px-4 py-3 text-sm ${
              i < mockEvents.length - 1 ? "border-b border-surface-800/60" : ""
            }`}
          >
            <span className="text-xs text-surface-600 font-mono shrink-0 w-32">
              {event.time}
            </span>
            <span className="text-surface-400 shrink-0 w-20">{event.actor}</span>
            <span className="text-surface-500">{event.action}</span>
            <span className="text-surface-300">{event.detail}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
