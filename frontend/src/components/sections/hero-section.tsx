"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const tickerItems = [
  { label: "AI & ML", icon: "+" },
  { label: "WEB DEV", icon: "✳" },
  { label: "CYBERSECURITY", icon: "→" },
  { label: "CODING", icon: "+" },
  { label: "CLOUD", icon: "✳" },
  { label: "NETWORKING", icon: "→" },
  { label: "OPEN SOURCE", icon: "+" },
  { label: "RESEARCH", icon: "✳" },
  { label: "HACKATHONS", icon: "✳" },
  { label: "WORKSHOPS", icon: "→" },
  { label: "ROBOTICS", icon: "+" },
  { label: "BLOCKCHAIN", icon: "✳" },
  { label: "GAME DEV", icon: "→" },
  { label: "DATA SCIENCE", icon: "+" },
  { label: "COMPETITIVE PROGRAMMING", icon: "✳" },
  { label: "INTER-IIT TECH", icon: "→" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex flex-col justify-between overflow-hidden bg-background ">
      {/* Ambient blue & violet gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-600/10 via-purple-600/5 to-transparent pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-80 h-80 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 sm:w-96 sm:h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Hero Content Area */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-24 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Pill Badge + IITGN Technical Council with Gradient */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-4">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wider uppercase shadow-sm">
              <span>JOIN &bull; LEARN &bull; BUILD</span>
            </div>

            {/* Big Headline */}
            <h1 className="text-7xl lg:text-[5.2rem] xl:text-[5.8rem] font-serif tracking-tight leading-[1.08] text-foreground select-none">
              <span className="block font-normal text-foreground">IITGN</span>
              <span className="flex items-center flex-wrap gap-x-3 sm:gap-x-4 gap-y-1 my-1 sm:my-2">
                {/* Technical Council with signature blue to purple gradient */}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-extrabold">
                  Technical Council
                </span>
              </span>
            </h1>
          </div>

          {/* Right Column: Bordered Quote + Actions + Stats */}
          <div className="lg:col-span-5 flex flex-col space-y-6 lg:pl-6">
            {/* Bordered Quote/Description */}
            <div className="border-l-2 border-blue-600 dark:border-purple-500 pl-4 py-1">
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
                Technical Council is the apex student technical body at IIT
                Gandhinagar. We empower students to innovate, learn, and build
                cutting-edge technology together.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 justify-center md:justify-start">
              <Button
                asChild
                size="lg"
                className="rounded-full px-6 py-2.5 h-auto text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:text-white  shadow-lg shadow-blue-500/20 transition-all duration-200 border-0">
                <Link href="/clubs" className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>Explore Clubs</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-6 py-2.5 text-yellow-700 dark:text-yellow-400 h-auto text-sm font-medium border-2 dark:border-yellow-400 border-yellow-400 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all duration-200 ">
                <Link href="/torque">
                  <span>Torque Magazine</span>
                </Link>
              </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-4 border-t border-border/60 max-w-md">
              <div className="space-y-0.5 border-r border-border/70 pr-4">
                <div className="text-2xl sm:text-3xl font-bold font-space-grotesk tracking-tight text-blue-600 dark:text-blue-400">
                  11+
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Active Clubs
                </div>
              </div>
              <div className="space-y-0.5 border-r border-border/70 pr-4">
                <div className="text-2xl sm:text-3xl font-bold font-space-grotesk tracking-tight text-indigo-600 dark:text-indigo-400">
                  20+
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Events/Year
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl sm:text-3xl font-bold font-space-grotesk tracking-tight text-purple-600 dark:text-purple-400">
                  7+
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Inter-IIT Wins
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Moving Marquee Ticker */}
      <div className="w-full border-y border-blue-500/15 dark:border-purple-500/20 bg-blue-500/[0.02] dark:bg-purple-950/20 backdrop-blur-sm py-3 sm:py-3.5 overflow-hidden select-none">
        <div className="animate-marquee-scroll flex items-center gap-6 sm:gap-8 text-xs sm:text-sm font-mono tracking-widest text-muted-foreground">
          {/* First set of items */}
          {tickerItems.map((item, index) => (
            <div
              key={`t1-${index}`}
              className="flex items-center gap-6 sm:gap-8 flex-shrink-0">
              <span className="font-semibold text-foreground/80 hover:text-foreground transition-colors cursor-default">
                {item.label}
              </span>
              <span className="text-blue-600 dark:text-purple-400 font-sans text-xs">
                {item.icon}
              </span>
            </div>
          ))}
          {/* Second duplicate set of items for seamless infinite scroll */}
          {tickerItems.map((item, index) => (
            <div
              key={`t2-${index}`}
              className="flex items-center gap-6 sm:gap-8 flex-shrink-0">
              <span className="font-semibold text-foreground/80 hover:text-foreground transition-colors cursor-default">
                {item.label}
              </span>
              <span className="text-blue-600 dark:text-purple-400 font-sans text-xs">
                {item.icon}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
