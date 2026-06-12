export function GittanLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle — head */}
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" fill="none" />

      {/* Git branch structure flipped upside down:
          - Two top nodes = eyes
          - Lines converge down = nose bridge
          - Bottom node = nose/mouth
          Like the git logo but inverted to form a face */}

      {/* Left eye — top-left node */}
      <circle cx="11" cy="10" r="2.5" fill="currentColor" />

      {/* Right eye — top-right node */}
      <circle cx="21" cy="10" r="2.5" fill="currentColor" />

      {/* Branch lines from eyes converging to nose */}
      <line x1="11" y1="12.5" x2="16" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="21" y1="12.5" x2="16" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Nose/chin node — where branches merge */}
      <circle cx="16" cy="19" r="2.5" fill="currentColor" />

      {/* Trunk line down from nose — chin/neck */}
      <line x1="16" y1="21.5" x2="16" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Grumpy mouth — small merge arc below nose */}
      <path d="M11 24 Q16 21 21 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}
