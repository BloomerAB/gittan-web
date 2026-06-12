export function EmptyState({
  title,
  description,
  command,
}: {
  title: string
  description?: string
  command?: string
}) {
  return (
    <div className="py-12 text-center">
      <p className="text-sm text-surface-500">{title}</p>
      {description && <p className="text-xs text-surface-600 mt-2">{description}</p>}
      {command && (
        <code className="block text-xs text-surface-400 bg-surface-900 border border-surface-800 rounded px-3 py-2 mt-3 mx-auto w-fit font-mono">
          {command}
        </code>
      )}
    </div>
  )
}
