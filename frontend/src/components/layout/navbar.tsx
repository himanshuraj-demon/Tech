"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, User, Sparkles, ArrowRight } from "lucide-react";

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

  // Prevent background scrolling when mobile menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-white/95 dark:bg-[#070c1b]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 shadow-xs"
          : pathname === "/"
          ? "bg-transparent border-b border-transparent"
          : "bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800"
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
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-[20px] tracking-tight font-space-grotesk text-gray-900 dark:text-gray-100 leading-tight">
              Technical Council
            </span>
            <span className="text-[7px] sm:text-[9px] font-semibold tracking-[0.22em] text-gray-500 dark:text-gray-400 uppercase">
              IIT Gandhinagar
            </span>
          </div>
        </Link>

        {/* Center Pill Navigation Capsule (Desktop XL) */}
        <nav className="hidden xl:flex items-center gap-1 bg-white/60 dark:bg-slate-950/50 p-1 rounded-full border border-gray-200/80 dark:border-white/10 backdrop-blur-md shadow-xs">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-1.5 text-[12px] font-medium rounded-full transition-all duration-200 select-none",
                  isActive
                    ? "bg-white dark:bg-slate-900/90 text-gray-900 dark:text-gray-100 shadow-xs font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/60 dark:hover:bg-slate-800/50"
                )}
              >
                {item.name}
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_#22d3ee]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Theme Toggle, Auth (Desktop only), Mobile Menu Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Desktop-only Auth and Theme Toggle */}
          <div className="hidden xl:flex items-center gap-2.5 sm:gap-3">
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
                className="bg-gradient-to-r px-4 py-2 from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-xs rounded-full transition-all duration-200 shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 border-0 flex items-center gap-1.5 select-none"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

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

      {/* Modern Mobile Navigation Overlay Starting from Top */}
      {isOpen && (
        <div className="fixed inset-0 z-50 h-screen w-full overflow-y-auto bg-white dark:bg-[#060913] text-gray-900 dark:text-gray-100 backdrop-blur-2xl px-5 py-4 flex flex-col justify-between animate-in fade-in-0 duration-200 xl:hidden">
          <div>
            {/* Top Bar inside mobile nav */}
            <div className="flex h-14 items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 select-none"
              >
                <ThemeAwareLogo
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full"
                  priority={true}
                />
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight font-space-grotesk text-gray-900 dark:text-gray-100 leading-tight">
                    Technical Council
                  </span>
                  <span className="text-[8px] font-semibold tracking-[0.22em] text-gray-500 dark:text-gray-400 uppercase">
                    IIT Gandhinagar
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  type="button"
                  className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-center transition-colors"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Navigation links */}
            <div className="py-6 space-y-3">
              <div className="text-[11px] font-mono tracking-widest text-gray-500 dark:text-gray-400 uppercase pb-1">
                Navigation
              </div>
              <nav className="grid gap-1.5">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-blue-500/10 text-blue-600 dark:text-cyan-400 font-semibold border border-blue-500/25"
                          : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                      )}
                    >
                      <span>{item.name}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#22d3ee]" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Bottom Footer inside mobile menu */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-4 pb-4">
            {status === "authenticated" && session?.user ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-100/80 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User Avatar"}
                      width={36}
                      height={36}
                      unoptimized
                      className="w-9 h-9 rounded-full border border-blue-500/30 object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {session.user.name}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                      {session.user.email}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-gray-500 hover:text-red-500"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  signIn("google", { callbackUrl: window.location.href });
                }}
                className="w-full bg-gradient-to-r py-2.5 from-blue-600 via-indigo-600 to-purple-600 text-white font-medium text-sm rounded-full transition-all duration-200 shadow-md shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
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
