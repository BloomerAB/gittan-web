import { useEffect, useState, useCallback } from "react"
import { Link, useOutletContext, useParams, useSearchParams, useLocation, useNavigate } from "react-router-dom"

import { api, type TBranch, type TCommit, type TFileEntry, type TRepo, type TTeam } from "../../api"
import { Skeleton } from "../../components/shared/Skeleton"

type TContext = { repo: TRepo; team: TTeam }

export function CodeTab() {
  const params = useParams()
  const { repo } = useOutletContext<TContext>()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  const teamName = params.teamName
  const repoName = params.repoName
  const rawPath = params["*"] ?? ""
  const currentRef = searchParams.get("ref") ?? "main"
  const currentPath = rawPath
  const orgName = repo.forgejoFullName.split("/")[0]

  const [entries, setEntries] = useState<TFileEntry[]>([])
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [branches, setBranches] = useState<TBranch[]>([])
  const [commits, setCommits] = useState<TCommit[]>([])
  const [loading, setLoading] = useState(true)
  const [showBranches, setShowBranches] = useState(false)
  const [copied, setCopied] = useState(false)

  const hash = location.hash
  const selectedLines = parseLineHash(hash)

  useEffect(() => {
    api.code.branches(orgName, repoName!).then(setBranches).catch(() => {})
  }, [orgName, repoName])

  useEffect(() => {
    if (!currentPath) {
      api.code.commits(orgName, repoName!, currentRef, 10).then(setCommits).catch(() => {})
    }
  }, [orgName, repoName, currentRef, currentPath])

  const pathKey = `${orgName}/${repoName}/${currentPath}@${currentRef}`
  const [lastPathKey, setLastPathKey] = useState("")

  useEffect(() => {
    if (pathKey === lastPathKey) return
    setLastPathKey(pathKey)
    setLoading(true)
    setFileContent(null)
    setFileName(null)

    api.code
      .files(orgName, repoName!, currentPath, currentRef)
      .then((result) => {
        if (Array.isArray(result)) {
          setEntries(result)
          setFileContent(null)
          setFileName(null)
        } else {
          setFileContent(atob((result as { content: string }).content))
          setFileName((result as { name: string }).name)
          setEntries([])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [pathKey, lastPathKey])

  const switchBranch = (branch: string) => {
    setSearchParams(branch === "main" ? {} : { ref: branch })
    setShowBranches(false)
  }

  const cloneUrl = `git@gittan.eu:${repo.forgejoFullName}.git`

  const copyClone = () => {
    navigator.clipboard.writeText(cloneUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLineClick = useCallback((lineNum: number, e: React.MouseEvent) => {
    e.preventDefault()
    if (e.shiftKey && selectedLines.start) {
      const newHash = `#L${selectedLines.start}-L${lineNum}`
      navigate(`${location.pathname}${location.search}${newHash}`, { replace: true })
    } else {
      const newHash = `#L${lineNum}`
      navigate(`${location.pathname}${location.search}${newHash}`, { replace: true })
    }
  }, [selectedLines.start, location.pathname, location.search, navigate])

  const copyLineLink = useCallback(() => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
  }, [])

  const latestCommit = commits[0]

  return (
    <div>
      {/* Clone bar + branch selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowBranches(!showBranches)}
              className="flex items-center gap-2 text-sm bg-surface-800 border border-surface-700 text-surface-300 pl-3 pr-2 py-1.5 rounded-md hover:border-surface-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-surface-500" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.75 2.5a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0V4.56L7.78 7.78a.75.75 0 0 1-1.06-1.06L9.94 3.5H8.19a.75.75 0 0 1 0-1.5h3.56ZM4.25 7a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5ZM1.5 8.25a2.75 2.75 0 1 1 3.5 2.645v.855a.75.75 0 0 1-1.5 0v-.855A2.751 2.751 0 0 1 1.5 8.25Z" />
              </svg>
              {currentRef}
              <svg className="w-3 h-3 text-surface-600" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 8.825a.5.5 0 0 1-.354-.146l-3.5-3.5a.5.5 0 1 1 .708-.708L6 7.618l3.146-3.147a.5.5 0 1 1 .708.708l-3.5 3.5A.5.5 0 0 1 6 8.825Z" />
              </svg>
            </button>
            {showBranches && (
              <div className="absolute top-full left-0 mt-1 bg-surface-900 border border-surface-700 rounded-md shadow-lg z-10 min-w-[200px] py-1">
                <div className="px-3 py-1.5 text-[11px] text-surface-600 uppercase tracking-wider">Branches</div>
                {branches.map((b) => (
                  <button
                    key={b.name}
                    onClick={() => switchBranch(b.name)}
                    className={`flex items-center w-full text-left px-3 py-1.5 text-sm hover:bg-surface-800 ${
                      b.name === currentRef ? "text-white" : "text-surface-400"
                    }`}
                  >
                    {b.name === currentRef && <span className="text-accent-400 mr-2">✓</span>}
                    <span className={b.name === currentRef ? "" : "ml-5"}>{b.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {currentPath && (
            <div className="text-sm text-surface-500">
              <Link to={`/${teamName}/${repoName}`} className="hover:text-accent-400">{repoName}</Link>
              {currentPath.split("/").map((part, i, arr) => {
                const path = arr.slice(0, i + 1).join("/")
                return (
                  <span key={path}>
                    <span className="text-surface-700 mx-1">/</span>
                    {i < arr.length - 1 ? (
                      <Link to={`/${teamName}/${repoName}/code/${path}`} className="hover:text-accent-400">{part}</Link>
                    ) : (
                      <span className="text-white font-medium">{part}</span>
                    )}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {!currentPath && (
          <div className="flex items-center gap-2">
            <code className="text-xs text-surface-500 bg-surface-900 border border-surface-800 rounded px-2.5 py-1.5 font-mono">
              {cloneUrl}
            </code>
            <button onClick={copyClone} className="text-xs bg-surface-800 border border-surface-700 text-surface-400 hover:text-white px-2 py-1.5 rounded transition-colors">
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-surface-900 border border-surface-800 rounded-md overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-2.5 border-b border-surface-800 last:border-b-0">
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </div>
      ) : fileContent !== null ? (
        /* File viewer with line linking */
        <div className="bg-surface-900 border border-surface-800 rounded-md overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-surface-800 bg-surface-800/30">
            <span className="text-sm text-surface-300">{fileName}</span>
            <div className="flex items-center gap-3">
              {selectedLines.start && (
                <button
                  onClick={copyLineLink}
                  className="text-[11px] text-surface-500 hover:text-accent-400 transition-colors"
                >
                  Copy link
                </button>
              )}
              <span className="text-[11px] text-surface-600">
                {fileContent.split("\n").length} lines
              </span>
            </div>
          </div>
          <pre className="text-[13px] text-surface-300 overflow-x-auto font-mono leading-[1.6]">
            {fileContent.split("\n").map((line, i) => {
              const lineNum = i + 1
              const isSelected = isLineSelected(lineNum, selectedLines)
              return (
                <div
                  key={i}
                  id={`L${lineNum}`}
                  className={`flex px-4 transition-colors ${
                    isSelected
                      ? "bg-accent-400/10 border-l-2 border-accent-400"
                      : "hover:bg-surface-800/20 border-l-2 border-transparent"
                  }`}
                >
                  <a
                    href={`#L${lineNum}`}
                    onClick={(e) => handleLineClick(lineNum, e)}
                    className={`w-12 text-right pr-4 select-none shrink-0 py-px cursor-pointer ${
                      isSelected ? "text-accent-400" : "text-surface-700 hover:text-surface-500"
                    }`}
                  >
                    {lineNum}
                  </a>
                  <span className="whitespace-pre py-px">{line || " "}</span>
                </div>
              )
            })}
          </pre>
        </div>
      ) : (
        /* File tree */
        <div className="bg-surface-900 border border-surface-800 rounded-md overflow-hidden">
          {latestCommit && !currentPath && (
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-surface-800 bg-surface-800/30">
              <AuthorAvatar name={latestCommit.author} />
              <span className="text-sm text-surface-300 font-medium truncate">{latestCommit.author}</span>
              <span className="text-sm text-surface-400 truncate flex-1">{latestCommit.message}</span>
              <span className="text-xs text-surface-600 font-mono shrink-0">{latestCommit.sha.slice(0, 7)}</span>
              <span className="text-xs text-surface-600 shrink-0">{timeAgo(latestCommit.timestamp)}</span>
            </div>
          )}

          {entries
            .sort((a, b) => {
              if (a.type !== b.type) return a.type === "dir" ? -1 : 1
              return a.name.localeCompare(b.name)
            })
            .map((entry) => (
              <Link
                key={entry.path}
                to={`/${teamName}/${repoName}/code/${entry.path}${currentRef !== "main" ? `?ref=${currentRef}` : ""}`}
                className="flex items-center px-4 py-2 border-b border-surface-800/60 last:border-b-0 hover:bg-surface-800/30 transition-colors group"
              >
                <span className="text-surface-500 mr-3 w-5 flex justify-center">
                  {entry.type === "dir" ? (
                    <svg className="w-4 h-4 text-surface-500" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-surface-600" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z" />
                    </svg>
                  )}
                </span>
                <span className={`text-sm group-hover:text-accent-400 transition-colors ${
                  entry.type === "dir" ? "text-surface-200" : "text-surface-400"
                }`}>
                  {entry.name}
                </span>
                {entry.size !== undefined && entry.type === "file" && (
                  <span className="text-[11px] text-surface-700 ml-auto">{formatSize(entry.size)}</span>
                )}
              </Link>
            ))}
        </div>
      )}

      {/* Commits */}
      {!currentPath && !loading && fileContent === null && commits.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-surface-400 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1.643 3.143.427 1.927A.25.25 0 0 1 .6 1.5h3.8a.25.25 0 0 1 .25.25v3.8a.25.25 0 0 1-.427.177L3.007 4.51A7.002 7.002 0 0 0 8 15a7 7 0 1 0-6.357-9.969.75.75 0 1 1-1.358-.632A8.502 8.502 0 0 1 8 .5a8.502 8.502 0 0 1 6.637 13.863A8.5 8.5 0 0 1 2.226 3.636l-.583-.493ZM8 3a.75.75 0 0 1 .75.75v3.72l2.03 1.175a.75.75 0 1 1-.75 1.3L7.47 8.21A.75.75 0 0 1 7 7.56V3.75A.75.75 0 0 1 8 3Z" />
            </svg>
            Commits on {currentRef}
          </h3>
          <div className="bg-surface-900 border border-surface-800 rounded-md overflow-hidden">
            {commits.map((c, i) => (
              <div
                key={c.sha}
                className={`flex items-center gap-3 px-4 py-2.5 ${
                  i < commits.length - 1 ? "border-b border-surface-800/60" : ""
                }`}
              >
                <AuthorAvatar name={c.author} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-300 truncate">{c.message}</p>
                  <p className="text-xs text-surface-600">{c.author} committed {timeAgo(c.timestamp)}</p>
                </div>
                <code className="text-xs text-surface-600 font-mono bg-surface-800 px-2 py-0.5 rounded shrink-0 hover:text-accent-400 cursor-default">
                  {c.sha.slice(0, 7)}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AuthorAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase()
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium text-white shrink-0"
      style={{ backgroundColor: `oklch(0.55 0.12 ${hue})` }}
    >{initial}</div>
  )
}

type TLineSelection = { start: number | null; end: number | null }

function parseLineHash(hash: string): TLineSelection {
  if (!hash) return { start: null, end: null }
  const match = hash.match(/^#L(\d+)(?:-L(\d+))?$/)
  if (!match) return { start: null, end: null }
  return {
    start: parseInt(match[1], 10),
    end: match[2] ? parseInt(match[2], 10) : null,
  }
}

function isLineSelected(lineNum: number, sel: TLineSelection): boolean {
  if (!sel.start) return false
  if (!sel.end) return lineNum === sel.start
  const min = Math.min(sel.start, sel.end)
  const max = Math.max(sel.start, sel.end)
  return lineNum >= min && lineNum <= max
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
