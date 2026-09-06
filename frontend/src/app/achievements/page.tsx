"use client";

import * as React from "react";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Award,
  Users,
  ArrowRight,
  MapPin,
  Flame,
} from "lucide-react";
import { useInterIITAchievements } from "@/lib/queries";
import { cn } from "@/lib/utils";

interface TeamMember {
  name: string;
  rollNumber?: string;
  branch?: string;
  year?: string;
  role?: string;
  email?: string;
  achievements?: string[];
}

interface Achievement {
  id: string;
  achievementType: string;
  competitionName: string;
  interIITEdition: string;
  year: string;
  hostIIT?: string;
  location?: string;
  ranking?: number;
  achievementDescription: string;
  significance?: string;
  competitionCategory?: string;
  achievementDate?: string;
  points?: number;
  status?: string;
  teamMembers: TeamMember[];
}

interface UIAchievement {
  id: string;
  year: string;
  position: string;
  event: string;
  description: string;
  team: string[];
  medal: "gold" | "silver" | "bronze" | "other";
  hostIIT?: string;
  edition?: string;
  category?: string;
}

function transformAchievements(achievements: Achievement[]): UIAchievement[] {
  return achievements.map((achievement) => {
    let medal: "gold" | "silver" | "bronze" | "other" = "bronze";
    let position = `${achievement.ranking || "N/A"}`;

    if (achievement.achievementType === "gold-medal" || achievement.ranking === 1) {
      medal = "gold";
      position = "1st Place (Gold)";
    } else if (achievement.achievementType === "silver-medal" || achievement.ranking === 2) {
      medal = "silver";
      position = "2nd Place (Silver)";
    } else if (achievement.achievementType === "bronze-medal" || achievement.ranking === 3) {
      medal = "bronze";
      position = "3rd Place (Bronze)";
    } else if (achievement.ranking) {
      medal = "other";
      position = `${achievement.ranking}${achievement.ranking === 1 ? "st" : achievement.ranking === 2 ? "nd" : achievement.ranking === 3 ? "rd" : "th"} Place`;
    }

    return {
      id: achievement.id,
      year: achievement.year,
      position,
      event: achievement.competitionName,
      description: achievement.achievementDescription,
      team: achievement.teamMembers.map((m) => m.name),
      medal,
      hostIIT: achievement.hostIIT,
      edition: achievement.interIITEdition,
      category: achievement.competitionCategory,
    };
  });
}

export default function AchievementsPage() {
  const { data: rawAchievements = [], isLoading } = useInterIITAchievements();

  const interIITAchievements: UIAchievement[] = React.useMemo(() => {
    return transformAchievements(rawAchievements as Achievement[]);
  }, [rawAchievements]);

  // Statistics calculation
  const stats = React.useMemo(() => {
    const goldCount = interIITAchievements.filter((a) => a.medal === "gold").length;
    const silverCount = interIITAchievements.filter((a) => a.medal === "silver").length;
    const bronzeCount = interIITAchievements.filter((a) => a.medal === "bronze").length;
    const participants = new Set(interIITAchievements.flatMap((a) => a.team)).size;

    return {
      total: interIITAchievements.length,
      gold: goldCount,
      silver: silverCount,
      bronze: bronzeCount,
      participants,
    };
  }, [interIITAchievements]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading achievements archive...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col pt-16 min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 border-b border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Subtle decorative grid and ambient radial washes */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 sm:w-[36rem] h-64 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4 text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold tracking-wider uppercase shadow-2xs">
              <Trophy className="w-3.5 h-3.5" />
              <span>HONORS & RECOGNITION</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight font-space-grotesk text-gray-900 dark:text-gray-100">
              Our <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Achievements</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
              Celebrating IIT Gandhinagar&apos;s triumphs at the Inter-IIT Tech Meet, national innovation summits, and premier robotics arenas.
            </p>

            {/* Quick Metrics Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 w-full max-w-2xl">
              <div className="p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xl sm:text-2xl font-bold font-space-grotesk text-amber-500">
                  <Trophy className="w-5 h-5" />
                  <span>{stats.gold}</span>
                </div>
                <div className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                  Gold Medals
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xl sm:text-2xl font-bold font-space-grotesk text-gray-400">
                  <Medal className="w-5 h-5" />
                  <span>{stats.silver}</span>
                </div>
                <div className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                  Silver Medals
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xl sm:text-2xl font-bold font-space-grotesk text-amber-700 dark:text-amber-600">
                  <Award className="w-5 h-5" />
                  <span>{stats.bronze}</span>
                </div>
                <div className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                  Bronze Medals
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xl sm:text-2xl font-bold font-space-grotesk text-blue-600 dark:text-blue-400">
                  <Users className="w-5 h-5" />
                  <span>{stats.participants}</span>
                </div>
                <div className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                  Achievers
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Achievements Grid */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {interIITAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {interIITAchievements.map((item) => {
                const isGold = item.medal === "gold";
                const isSilver = item.medal === "silver";
                const isBronze = item.medal === "bronze";

                const badgeBg = isGold
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : isSilver
                  ? "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-400/30"
                  : isBronze
                  ? "bg-amber-700/10 text-amber-700 dark:text-amber-500 border-amber-700/30"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";

                const glowColor = isGold
                  ? "from-amber-500/15 via-yellow-500/5 to-transparent"
                  : isSilver
                  ? "from-slate-400/15 via-gray-400/5 to-transparent"
                  : isBronze
                  ? "from-amber-700/15 via-orange-600/5 to-transparent"
                  : "from-blue-600/15 via-indigo-600/5 to-transparent";

                const IconComponent = isGold ? Trophy : isSilver ? Medal : Award;

                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md p-6 sm:p-7 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 hover:border-blue-500/30"
                  >
                    {/* Top Ambient Glow */}
                    <div
                      className={cn(
                        "absolute top-0 right-0 w-3/4 h-1/2 bg-gradient-to-bl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                        glowColor
                      )}
                    />

                    <div>
                      {/* Top Row: Medal Badge + Year */}
                      <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs",
                            badgeBg
                          )}
                        >
                          <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{item.position}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-gray-500 dark:text-gray-400">
                          <span>{item.year}</span>
                        </div>
                      </div>

                      {/* Event Title & Edition */}
                      <div className="relative z-10 space-y-2">
                        {item.edition && (
                          <div className="text-[11px] font-mono tracking-wider text-blue-600 dark:text-blue-400 uppercase font-semibold">
                            {item.edition}
                          </div>
                        )}

                        <h3 className="text-lg sm:text-xl font-bold font-space-grotesk tracking-tight text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
                          {item.event}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Team Members List */}
                    <div className="relative z-10 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800/80">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span>Team Members ({item.team.length})</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {item.team.map((member, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700/60"
                          >
                            {member}
                          </span>
                        ))}
                      </div>

                      {item.hostIIT && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 mt-3">
                          <MapPin className="w-3 h-3" />
                          <span>Hosted at {item.hostIIT}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 max-w-md mx-auto">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-60" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                No achievements recorded yet
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Check back later as new competitions and events are updated.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Bottom Inspiration CTA */}
      <section className="pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-900/90 dark:via-gray-800/60 dark:to-gray-900/90 p-8 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5" />
                <span>Join The Legacy</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-bold font-space-grotesk text-gray-900 dark:text-gray-100">
                Ready to represent IIT Gandhinagar on the podium?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl">
                Prepare with our technical clubs, tackle competitive challenges, and be part of the contingent at the upcoming Inter-IIT Tech Meet.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href="/clubs"
                className="bg-gradient-to-r px-5 py-2.5 from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-sm rounded-full transition-all duration-200 shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 flex items-center gap-2 select-none"
              >
                <span>Explore Tech Clubs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/hackathons"
                className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-sm rounded-full transition-all duration-200"
              >
                View Hackathons
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
