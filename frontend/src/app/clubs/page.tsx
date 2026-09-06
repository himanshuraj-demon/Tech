"use client";

import * as React from "react";
import { Loader2, AlertCircle, RefreshCw, Search, Sparkles, Compass, Cpu, Palette, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClubCard } from "@/components/clubs/club-card";
import { useClubs } from "@/lib/queries";
import { cn } from "@/lib/utils";

interface Club {
  id: string;
  name: string;
  description: string;
  type: "club" | "hobby-group";
  category: string;
  logoPath?: string;
}

export default function ClubsPage() {
  const { data, isLoading, error, refetch } = useClubs();
  const clubs: Club[] = React.useMemo(() => {
    return Array.isArray(data) ? data : (data?.clubs ?? []);
  }, [data]);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTab, setSelectedTab] = React.useState<"all" | "technical" | "hobby">("all");

  // Separate clubs, hobby groups, and technical council groups
  const technicalClubs = clubs.filter((item) => item.type === "club");
  const hobbyGroups = clubs.filter((item) => item.type === "hobby-group");

  // Filter based on search query and active tab
  const filteredClubs = React.useMemo(() => {
    return clubs.filter((club) => {
      const matchesSearch =
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (club.category && club.category.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedTab === "technical") return club.type === "club";
      if (selectedTab === "hobby") return club.type === "hobby-group";
      return true;
    });
  }, [clubs, searchQuery, selectedTab]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Loading clubs and hobby groups...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
        <p className="text-red-600 mb-4 text-center max-w-md text-sm">Failed to load clubs. Please try again.</p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="flex items-center gap-2 rounded-full">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col pt-14 min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-16 border-b border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 sm:w-[36rem] h-64 bg-blue-500/5 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4 text-center max-w-3xl mx-auto">

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight font-space-grotesk text-gray-900 dark:text-gray-100">
              Explore Our <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Clubs & Communities</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
              Discover your passion, collaborate with passionate builders, and turn ambitious ideas into reality across technology, hardware, and creative domains.
            </p>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 w-full max-w-lg">
              <div className="p-3 sm:p-4 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 text-center">
                <div className="text-2xl sm:text-3xl font-bold font-space-grotesk text-blue-600 dark:text-blue-400">
                  {technicalClubs.length}
                </div>
                <div className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">
                  Tech Clubs
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 text-center">
                <div className="text-2xl sm:text-3xl font-bold font-space-grotesk text-purple-600 dark:text-purple-400">
                  {hobbyGroups.length}
                </div>
                <div className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">
                  Hobby Groups
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 text-center">
                <div className="text-2xl sm:text-3xl font-bold font-space-grotesk text-emerald-600 dark:text-emerald-400">
                  100+
                </div>
                <div className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">
                  Active Members
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Controls: Search & Tabs */}
      <section className="sticky top-16 z-30 bg-white/85 dark:bg-gray-900/85 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-center gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 overflow-x-auto max-w-full">
            {(
              [
                { id: "all", label: "All Groups", icon: Compass, count: clubs.length },
                { id: "technical", label: "Technical", icon: Cpu, count: technicalClubs.length },
                { id: "hobby", label: "Hobby", icon: Palette, count: hobbyGroups.length },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 select-none whitespace-nowrap",
                    isActive
                      ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xs font-semibold"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full",
                      isActive
                        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                        : "bg-gray-200/80 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* Main Club Directory Grid */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {filteredClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredClubs.map((club) => {
                const variant =club.type === "hobby-group"
                    ? "hobby"
                    : "technical";

                return <ClubCard key={club.id} club={club} variant={variant} />;
              })}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                No clubs matched your search
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
                We couldn&apos;t find any clubs matching &ldquo;{searchQuery}&rdquo;. Try another keyword or clear the filters.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTab("all");
                }}
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
