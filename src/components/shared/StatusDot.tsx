const colors = {
  passed: "bg-ok-400",
  failed: "bg-err-400",
  running: "bg-yellow-400 animate-pulse",
  idle: "bg-ok-400",
  pending: "bg-surface-600",
  skipped: "bg-surface-600",
} as const

type TStatus = keyof typeof colors

export function StatusDot({ status, size = "sm" }: { status: TStatus; size?: "sm" | "md" }) {
  const px = size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5"
  return <span className={`inline-block rounded-full ${px} ${colors[status]}`} />
}
