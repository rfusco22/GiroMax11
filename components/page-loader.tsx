"use client"

import { useState, useEffect } from "react"

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const hasShownLoader = sessionStorage.getItem("hasShownLoader")

    if (hasShownLoader === "true") {
      // Skip the loader if already shown
      setIsLoading(false)
      return
    }

    // Mark loader as shown for this session
    sessionStorage.setItem("hasShownLoader", "true")

    // Start fade out animation at 4.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 4500)

    // Remove loader at 5 seconds
    const removeTimer = setTimeout(() => {
      setIsLoading(false)
    }, 5000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!isLoading) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Animated Logo */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 animate-spin-slow">
          <div className="h-32 w-32 rounded-full border-4 border-transparent border-t-primary border-r-accent opacity-30" />
        </div>

        {/* Pulsing glow effect */}
        <div className="absolute inset-0 animate-pulse-glow">
          <div className="h-32 w-32 rounded-full bg-primary/10 blur-xl" />
        </div>

        {/* Main SVG Icon with animations */}
        <svg viewBox="0 0 1080 1920" className="h-32 w-32 animate-logo-appear" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#121A56">
                <animate
                  attributeName="stop-color"
                  values="#121A56;#F5A017;#121A56"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#F5A017">
                <animate
                  attributeName="stop-color"
                  values="#F5A017;#DB530F;#F5A017"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
          </defs>

          {/* First path - draws in */}
          <path
            fill="url(#logoGradient)"
            d="m898.74,1317.22c-29.86-29.4-59.2-58.27-89.62-88.22,4.47-4.81,8.69-9.12,12.66-13.64,79.36-90.57,111.1-195.3,94.07-314.75-1.26-8.85-4.16-11.8-13.21-11.77-93.91.27-187.83.06-281.74.31-4.86.01-11.1,1.53-14.35,4.73-45.13,44.37-89.85,89.16-137.11,136.29h297.04c-7.19,71.16-100.7,152.82-188.1,165.82-111.75,16.61-217.21-42.66-259.44-145.83-41.56-101.53-8.36-218.55,80.12-283.34,87.23-63.87,216.13-65.82,309.54,22.44,62.56-62.85,125.15-125.71,187.67-188.52,193.56,183.25,207.03,516.71,2.48,716.49Z"
            className="animate-draw-path-1"
            strokeDasharray="3000"
            strokeDashoffset="3000"
            stroke="#121A56"
            strokeWidth="2"
          />

          {/* Second path - draws in with delay */}
          <path
            fill="url(#logoGradient)"
            d="m708.58,1301.88c.32,5.41.74,9.27.74,13.13.06,37.21-.18,74.41.24,111.62.09,8.3-1.88,12.41-10.51,14.98-186.18,55.36-353.92,21.32-499.73-107.17-95.89-84.5-149.64-193.26-163.21-320.12C7.24,744.19,192.35,510.09,443.32,462.18c86.16-16.45,170.68-11.12,254.17,15.35,9.27,2.94,12.26,7.04,12.11,16.65-.57,36.31-.21,72.64-.26,108.96,0,4.31-.41,8.61-.74,14.83-108.72-49.36-217.24-52.63-325.58-4.34-72.88,32.49-129.67,84.06-170.17,152.79-81.81,138.86-67.57,311.87,34.11,435.81,95.09,115.91,276.9,185.08,461.61,99.64Z"
            className="animate-draw-path-2"
            strokeDasharray="3000"
            strokeDashoffset="3000"
            stroke="#121A56"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Brand name with typing effect */}
      <div className="mt-8 overflow-hidden">
        <h1 className="animate-slide-up text-3xl font-bold tracking-wider">
          <span className="text-primary">GIROS</span> <span className="text-accent">MAX</span>
        </h1>
      </div>

      {/* Loading bar */}
      <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-muted">
        <div className="h-full animate-loading-bar rounded-full bg-gradient-to-r from-primary via-accent to-accent-dark" />
      </div>

      {/* Loading text */}
      <p className="mt-4 animate-pulse text-sm text-muted-foreground">Cargando...</p>
    </div>
  )
}
