"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, User, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeAwareLogo } from "@/components/ui/theme-aware-logo";
import { useSession, signIn, signOut } from "next-auth/react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Clubs", href: "/clubs" },
  { name: "Hackathons", href: "/hackathons" },
  { name: "Achievements", href: "/achievements" },
  { name: "Gallery", href: "/gallery" },
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "Contact Us", href: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Track scroll position to enhance background blur and shadow dynamically
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300 border-b border-gray-200 dark:border-gray-800",
        isScrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur shadow-xs"
          : "bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="group flex items-center gap-3 select-none flex-shrink-0">
          <ThemeAwareLogo
            width={40}
            height={40}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full transition-transform duration-300 group-hover:scale-105"
            priority={true}
          />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm sm:text-xl tracking-tight font-space-grotesk text-gray-900 dark:text-gray-100">
              Technical Council
            </span>
           
          </div>
        </Link>

        {/* Center Pill Navigation Capsule (Desktop XL) */}
        <nav className="hidden xl:flex items-center gap-1 bg-gray-100/90 dark:bg-gray-800/80 p-1 rounded-full border border-gray-200 dark:border-gray-700/80 backdrop-blur shadow-xs">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 select-none",
                  isActive
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xs font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/60 dark:hover:bg-gray-700/50"
                )}
              >
                {item.name}
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Theme Toggle, Auth, Mobile Menu Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />

          {/* Student Session Authentication UI */}
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full border border-gray-200 animate-pulse bg-gray-100 dark:bg-gray-800" />
          ) : status === "authenticated" && session?.user ? (
            <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 border-l border-gray-200 dark:border-gray-800">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-semibold leading-tight text-gray-900 dark:text-gray-100">
                  {session.user.name}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                  {session.user.email}
                </span>
              </div>
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User Avatar"}
                  width={32}
                  height={32}
                  unoptimized
                  className="w-8 h-8 rounded-full border border-blue-500/30 ring-1 ring-blue-500/20 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/" })}
                title="Sign Out"
                className="h-8 w-8 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google", { callbackUrl: window.location.href })}
              className="bg-gradient-to-r px-3.5 py-1.5 from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-xs rounded-full transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 border-0 flex items-center gap-1.5 select-none"
            >
              
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center xl:hidden transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
          >
            {isOpen ? (
              <X className="h-4 w-4 text-gray-900 dark:text-gray-100 transition-transform duration-200 rotate-90" />
            ) : (
              <Menu className="h-4 w-4 text-gray-900 dark:text-gray-100" />
            )}
          </button>
        </div>
      </div>

      {/* Modern Mobile Navigation Drawer */}
      {isOpen && (
        <div className="fixed inset-x-0 top-16 z-50 h-[calc(100vh-4rem)] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between animate-in fade-in-0 slide-in-from-top-4 duration-300 xl:hidden">
          <div className="space-y-6">
            <div className="text-xs font-mono tracking-widest text-gray-500 dark:text-gray-400 uppercase pb-2 border-b border-gray-200 dark:border-gray-800">
              Navigation
            </div>
            <nav className="grid gap-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                    )}
                  >
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Technical Council IITGN</span>
              <span>v2.0</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
