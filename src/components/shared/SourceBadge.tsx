const styles = {
  policy: "text-policy-400 bg-policy-400/10",
  template: "text-surface-400 bg-surface-800",
  repo: "",
} as const

type TSource = keyof typeof styles

export function SourceBadge({ source, name }: { source: TSource; name?: string }) {
  if (source === "repo") return null

  const label = name ? `${source}: ${name}` : source

  return (
    <span className={`text-[11px] px-1.5 py-0.5 rounded ${styles[source]}`}>
      {label}
    </span>
  )
}
