import { cn } from "@/lib/utils"

interface GirosMaxLogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}

export function GirosMaxLogo({ className, showText = true, size = "md" }: GirosMaxLogoProps) {
  const sizes = {
    sm: { icon: "w-8 h-8", text: "text-lg" },
    md: { icon: "w-10 h-10", text: "text-xl" },
    lg: { icon: "w-14 h-14", text: "text-2xl" },
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Logo Icon - Círculo con G estilizada */}
      <div className={cn("relative rounded-full bg-[#121A56] flex items-center justify-center", sizes[size].icon)}>
        <svg viewBox="0 0 40 40" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Círculo exterior */}
          <circle cx="20" cy="20" r="18" stroke="#121A56" strokeWidth="4" fill="#121A56" />
          {/* G estilizada con flecha */}
          <path
            d="M12 20C12 15.58 15.58 12 20 12C22.5 12 24.7 13.1 26.2 14.8L24 17C23 15.8 21.6 15 20 15C17.24 15 15 17.24 15 20C15 22.76 17.24 25 20 25C21.8 25 23.4 24 24.3 22.5H20V19.5H28V20C28 24.42 24.42 28 20 28C15.58 28 12 24.42 12 20Z"
            fill="white"
          />
          {/* Flecha circular */}
          <path d="M26 14L28 12L30 14L28 16L26 14Z" fill="#F5A017" />
        </svg>
      </div>
      {showText && <span className={cn("font-bold text-[#DB530F]", sizes[size].text)}>GIROS MAX</span>}
    </div>
  )
}
