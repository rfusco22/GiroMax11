"use client"

export function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Ocean background */}
      <circle cx="12" cy="12" r="10" fill="#4299E1" />

      {/* South America */}
      <path
        d="M10 8C10 8 9 9 9 10C9 11 8.5 12 8.5 13C8.5 14 9 15 9.5 16C10 17 10 18 10 18.5C10 19 10.5 19 11 18.5C11.5 18 12 17 12 16C12 15 12 14 12.5 13.5C13 13 13.5 12 13.5 11.5C13.5 11 13 10.5 12.5 10C12 9.5 11.5 9 11 8.5C10.5 8 10 8 10 8Z"
        fill="#48BB78"
      />

      {/* Central America */}
      <path d="M9.5 7C9.5 7 9 7.5 9 8C9 8.5 9.5 8.5 10 8C10.5 7.5 10 7 9.5 7Z" fill="#48BB78" />

      {/* North part visible */}
      <path d="M8 5.5C8 5.5 8.5 6 9 6C9.5 6 10 5.5 10 5C10 4.5 9 4.5 8.5 5C8 5.5 8 5.5 8 5.5Z" fill="#48BB78" />

      {/* Light reflection */}
      <ellipse cx="8" cy="8" rx="2.5" ry="3" fill="white" fillOpacity="0.2" />
    </svg>
  )
}
