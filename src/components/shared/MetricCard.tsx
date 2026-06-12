const colorClasses = {
  emerald: "text-accent-400",
  yellow: "text-yellow-400",
  red: "text-red-400",
  zinc: "text-surface-500",
} as const

type TColor = keyof typeof colorClasses

export function MetricCard({
  label,
  value,
  description,
  color = "zinc",
}: {
  label: string
  value: string
  description: string
  color?: TColor
}) {
  return (
    <div className="bg-surface-900 border border-surface-800 rounded-lg p-4">
      <p className="text-[11px] uppercase text-surface-500 tracking-wider">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${colorClasses[color]}`}>{value}</p>
      <p className="text-[11px] text-surface-600 mt-1">{description}</p>
    </div>
  )
}
