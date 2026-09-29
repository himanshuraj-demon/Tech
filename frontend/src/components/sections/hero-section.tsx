"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Compass,
  FileText,
  Box,
  FlaskConical,
  Code2,
  Users,
  Bot,
  Layers,
  Gamepad2,
  BarChart3,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const dockItems = [
  {
    label: "OPEN SOURCE",
    icon: Box,
    href: "/clubs",
    color: "text-blue-500 dark:text-blue-400",
  },
  {
    label: "RESEARCH",
    icon: FlaskConical,
    href: "/about",
    color: "text-purple-500 dark:text-purple-400",
  },
  {
    label: "HACKATHONS",
    icon: Code2,
    href: "/hackathons",
    color: "text-cyan-500 dark:text-cyan-400",
  },
  {
    label: "WORKSHOPS",
    icon: Users,
    href: "/clubs",
    color: "text-violet-500 dark:text-violet-400",
  },
  {
    label: "ROBOTICS",
    icon: Bot,
    href: "/clubs",
    color: "text-indigo-500 dark:text-indigo-400",
  },
  {
    label: "BLOCKCHAIN",
    icon: Layers,
    href: "/clubs",
    color: "text-blue-500 dark:text-blue-400",
  },
  {
    label: "GAME DEV",
    icon: Gamepad2,
    href: "/clubs",
    color: "text-pink-500 dark:text-pink-400",
  },
  {
    label: "DATA SCIENCE",
    icon: BarChart3,
    href: "/clubs",
    color: "text-sky-500 dark:text-sky-400",
  },
  {
    label: "COMPETITIONS",
    icon: Trophy,
    href: "/achievements",
    color: "text-purple-500 dark:text-purple-400",
  },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-between overflow-hidden pt-10 sm:pt-20 pb-4 md:pb-6">
      {/* Background Images: Dark & Light Mode */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
        {/* Dark Mode Background */}
        <div className="relative w-full h-full hidden dark:block">
          <Image
            src="/backblack.png"
            alt="IIT Gandhinagar Campus Night"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-[40%_center] lg:object-center brightness-[0.92] contrast-[1.05]"
          />
        </div>

        {/* Light Mode Background */}
        <div className="relative w-full h-full block dark:hidden">
          <Image
            src="/backwhite.png"
            alt="IIT Gandhinagar Campus Day"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-[25%_center] lg:object-center brightness-[1.05] contrast-[1]"
          />
        </div>
      </div>

      {/* Main Hero Content Area */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center my-auto py-8">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Pill Badge + Big Headline + Tagline + Scroll */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-4 sm:space-y-5">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-50/80 dark:bg-blue-950/40 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <span className="text-blue-600 dark:text-cyan-300 text-[11px] sm:text-xs font-mono tracking-widest font-semibold uppercase">
                LEARN &bull; BUILD &bull; INNOVATE &bull; TOGETHER
              </span>
            </div>

            {/* Big Stacked Headline */}
            <h1 className="text-5xl sm:text-7xl lg:text-[5.4rem] xl:text-[6.2rem] font-bold font-space-grotesk tracking-tight leading-[0.98] select-none">
              {/* IITGN */}
              <span className="block text-slate-950 dark:text-white font-extrabold drop-shadow-sm">
                IITGN
              </span>

              {/* Technical */}
              <span
                className="
      block font-extrabold my-1
      bg-gradient-to-r
      from-cyan-600 via-sky-600 to-blue-700
      dark:from-cyan-400 dark:via-sky-400 dark:to-blue-500
      bg-clip-text text-transparent
    ">
                Technical
              </span>

              {/* Council */}
              <span
                className="
      block font-extrabold
      bg-gradient-to-r
      from-indigo-600 via-purple-600 to-pink-600
      dark:from-indigo-400 dark:via-purple-400 dark:to-pink-500
      bg-clip-text text-transparent
    ">
                Council
              </span>
            </h1>
          </div>

          {/* Right Column: Bordered Quote + Actions + Stats */}
          <div className="lg:col-span-5 flex flex-col space-y-6 lg:pl-4">
            {/* Bordered Quote/Description */}
            <div className="border-l-2 border-purple-500 dark:border-purple-500 pl-4 py-1">
              <p className="text-xs sm:text-base text-white dark:text-slate-300 leading-relaxed max-w-lg font-normal">
                Technical Council is the apex student technical body at IIT
                Gandhinagar. We empower students to innovate, learn, and build
                cutting-edge technology together.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex  items-center gap-2 sm:gap-4 pt-1 justify-center">
              <Button
                asChild
                size="lg"
                className="rounded-full px-5 py-2.5 h-auto text-sm font-medium bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 dark:text-white shadow-lg shadow-blue-500/25 transition-all duration-200 border-0 hover:scale-105 active:scale-95">
                <Link href="/clubs" className="flex items-center gap-2 ">
                  <Compass className="w-4 h-4" />
                  <span>Explore Clubs</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-5 py-2.5 h-auto text-sm font-medium border border-slate-300 dark:border-white/20 bg-white/60 dark:bg-slate-900/50 hover:bg-white/90 dark:hover:bg-slate-800/80 text-slate-800 dark:text-white backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95">
                <Link href="/torque" className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Torque Magazine</span>
                </Link>
              </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 max-w-md  bg-white rounded-2xl p-4 text-center dark:bg-transparent">
              <div className="space-y-1 border-r border-slate-300/80 dark:border-slate-800 pr-4">
                <div className="text-3xl sm:text-4xl font-bold font-space-grotesk tracking-tight text-blue-600 dark:text-blue-400">
                  11+
                </div>
                <div className="text-xs text-slate-600 dark:text-white font-medium">
                  Active Clubs
                </div>
              </div>
              <div className="space-y-1 border-r border-slate-300/80 dark:border-slate-800 pr-4">
                <div className="text-3xl sm:text-4xl font-bold font-space-grotesk tracking-tight text-indigo-600 dark:text-indigo-400">
                  20+
                </div>
                <div className="text-xs text-slate-600 dark:text-white font-medium">
                  Events/Year
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-bold font-space-grotesk tracking-tight text-purple-600 dark:text-purple-400">
                  7+
                </div>
                <div className="text-xs text-slate-600 dark:text-white font-medium">
                  Inter-IIT Wins
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Capsule Categories Bar with Continuous Horizontal Moving Animation */}
      <div className="w-full relative z-10 px-4 sm:px-6 lg:px-8 mt-4">
        <div className="max-w-7xl mx-auto rounded-2xl lg:rounded-full border border-slate-200/80 dark:border-blue-500/20 bg-white/75 dark:bg-slate-950/65 backdrop-blur-xl py-2.5 px-4 sm:px-6 shadow-xl dark:shadow-2xl dark:shadow-black/60 overflow-hidden select-none">
          <div className="animate-marquee-scroll flex items-center gap-6 sm:gap-8">
            {/* First set of items */}
            {dockItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={`d1-${item.label}`}
                  className="flex items-center gap-6 sm:gap-8 flex-shrink-0">
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-300 transition-colors group select-none py-0.5">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-transform duration-200 group-hover:scale-110",
                        item.color,
                      )}
                    />
                    <span className="font-mono text-[11px] sm:text-xs font-semibold tracking-wider whitespace-nowrap">
                      {item.label}
                    </span>
                  </Link>
                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-800/80 shrink-0" />
                </div>
              );
            })}

            {/* Second duplicate set of items for seamless infinite scroll */}
            {dockItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={`d2-${item.label}`}
                  className="flex items-center gap-6 sm:gap-8 flex-shrink-0">
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-300 transition-colors group select-none py-0.5">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-transform duration-200 group-hover:scale-110",
                        item.color,
                      )}
                    />
                    <span className="font-mono text-[11px] sm:text-xs font-semibold tracking-wider whitespace-nowrap">
                      {item.label}
                    </span>
                  </Link>
                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-800/80 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
