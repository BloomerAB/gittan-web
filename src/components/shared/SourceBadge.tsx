const styles = {
  policy: "text-indigo-400 bg-indigo-400/10",
  template: "text-amber-400 bg-amber-400/10",
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
