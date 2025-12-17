interface FlagProps {
  className?: string
}

// Spanish flag - circular
export function SpainFlag({ className = "w-6 h-6" }: FlagProps) {
  return (
    <svg viewBox="0 0 36 36" className={className}>
      <circle cx="18" cy="18" r="18" fill="#C60A1D" />
      <rect y="9" width="36" height="18" fill="#FFC400" />
      <path d="M0 9 A18 18 0 0 1 36 9 L36 9 L0 9 Z" fill="#C60A1D" />
      <path d="M0 27 A18 18 0 0 0 36 27 L36 27 L0 27 Z" fill="#C60A1D" />
    </svg>
  )
}

// USA flag - circular
export function USAFlag({ className = "w-6 h-6" }: FlagProps) {
  return (
    <svg viewBox="0 0 36 36" className={className}>
      <defs>
        <clipPath id="circleClip">
          <circle cx="18" cy="18" r="18" />
        </clipPath>
      </defs>
      <g clipPath="url(#circleClip)">
        {/* Red and white stripes */}
        <rect width="36" height="36" fill="#B22234" />
        <rect y="2.77" width="36" height="2.77" fill="#FFFFFF" />
        <rect y="8.31" width="36" height="2.77" fill="#FFFFFF" />
        <rect y="13.85" width="36" height="2.77" fill="#FFFFFF" />
        <rect y="19.38" width="36" height="2.77" fill="#FFFFFF" />
        <rect y="24.92" width="36" height="2.77" fill="#FFFFFF" />
        <rect y="30.46" width="36" height="2.77" fill="#FFFFFF" />
        {/* Blue canton */}
        <rect width="14.4" height="19.38" fill="#3C3B6E" />
        {/* Stars (simplified) */}
        <g fill="#FFFFFF">
          <circle cx="2.4" cy="2" r="0.8" />
          <circle cx="4.8" cy="2" r="0.8" />
          <circle cx="7.2" cy="2" r="0.8" />
          <circle cx="9.6" cy="2" r="0.8" />
          <circle cx="12" cy="2" r="0.8" />
          <circle cx="3.6" cy="4" r="0.8" />
          <circle cx="6" cy="4" r="0.8" />
          <circle cx="8.4" cy="4" r="0.8" />
          <circle cx="10.8" cy="4" r="0.8" />
          <circle cx="2.4" cy="6" r="0.8" />
          <circle cx="4.8" cy="6" r="0.8" />
          <circle cx="7.2" cy="6" r="0.8" />
          <circle cx="9.6" cy="6" r="0.8" />
          <circle cx="12" cy="6" r="0.8" />
          <circle cx="3.6" cy="8" r="0.8" />
          <circle cx="6" cy="8" r="0.8" />
          <circle cx="8.4" cy="8" r="0.8" />
          <circle cx="10.8" cy="8" r="0.8" />
          <circle cx="2.4" cy="10" r="0.8" />
          <circle cx="4.8" cy="10" r="0.8" />
          <circle cx="7.2" cy="10" r="0.8" />
          <circle cx="9.6" cy="10" r="0.8" />
          <circle cx="12" cy="10" r="0.8" />
          <circle cx="3.6" cy="12" r="0.8" />
          <circle cx="6" cy="12" r="0.8" />
          <circle cx="8.4" cy="12" r="0.8" />
          <circle cx="10.8" cy="12" r="0.8" />
          <circle cx="2.4" cy="14" r="0.8" />
          <circle cx="4.8" cy="14" r="0.8" />
          <circle cx="7.2" cy="14" r="0.8" />
          <circle cx="9.6" cy="14" r="0.8" />
          <circle cx="12" cy="14" r="0.8" />
          <circle cx="3.6" cy="16" r="0.8" />
          <circle cx="6" cy="16" r="0.8" />
          <circle cx="8.4" cy="16" r="0.8" />
          <circle cx="10.8" cy="16" r="0.8" />
          <circle cx="2.4" cy="18" r="0.8" />
          <circle cx="4.8" cy="18" r="0.8" />
          <circle cx="7.2" cy="18" r="0.8" />
          <circle cx="9.6" cy="18" r="0.8" />
          <circle cx="12" cy="18" r="0.8" />
        </g>
      </g>
      {/* Circle border */}
      <circle cx="18" cy="18" r="17" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
    </svg>
  )
}
