"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative" aria-label="Toggle theme">
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative"
      aria-label="Toggle theme"
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] transition-all ${isDark ? "-rotate-90 scale-0" : "rotate-0 scale-100"}`} />
      <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${isDark ? "rotate-0 scale-100" : "rotate-90 scale-0"}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

