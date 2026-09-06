"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, LogOut, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeAwareLogo } from "@/components/ui/theme-aware-logo"
import { useSession, signIn, signOut } from "next-auth/react"

const navigation = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Clubs", href: "/clubs" },
  { name: "Hackathons", href: "/hackathons" },
  { name: "Achievements", href: "/achievements" },
  { name: "Gallery", href: "/gallery" },
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "Contact Us", href: "/contact" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden xl:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <ThemeAwareLogo
              width={48}
              height={48}
              className="h-12 w-12 rounded-full"
              priority={true}
            />
            <span className="hidden font-bold sm:inline-block font-space-grotesk">
              Technical Council
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-gray-900 dark:hover:text-gray-100",
                  pathname === item.href ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 xl:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        {/* Mobile logo and theme toggle */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/" className="flex items-center space-x-2 xl:hidden">
              <ThemeAwareLogo
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
                priority={true}
              />
              <span className="font-bold font-space-grotesk">Technical Council</span>
            </Link>
          </div>
          <nav className="flex items-center gap-3">
            <ThemeToggle />
            
            {/* Student Session Authentication UI */}
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full border border-gray-200 animate-pulse bg-gray-100 dark:bg-gray-800" />
            ) : status === "authenticated" && session?.user ? (
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold leading-none">{session.user.name}</span>
                  <span className="text-[10px] text-muted-foreground">{session.user.email}</span>
                </div>
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User Avatar"}
                    className="w-8 h-8 rounded-full border border-primary/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  title="Sign Out"
                  className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => signIn("google", { callbackUrl: window.location.href })}
                className="bg-gradient-to-r px-3 py-1.5 from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white  transition-all duration-100 ease-in-out hover:scale-110 shadow-sm border-0 rounded-full text-sm"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] w-full grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in slide-in-from-bottom-80 xl:hidden">
          <div className="relative z-20 grid gap-6 rounded-md bg-white dark:bg-gray-800 p-4 text-gray-900 dark:text-gray-100 shadow-md">
            <nav className="grid grid-flow-row auto-rows-max text-sm">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline",
                    pathname === item.href ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
