"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, Trophy, Clock, ExternalLink, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHackathonStats, useHackathonsList } from "@/lib/queries";

export function HackathonsClient() {
  const [upcomingLimit, setUpcomingLimit] = useState(6);
  const [ongoingLimit, setOngoingLimit] = useState(6);
  const [completedLimit, setCompletedLimit] = useState(6);

  // Queries
  const {
    data: stats = {
      totalCount: 0,
      upcomingCount: 0,
      ongoingCount: 0,
      completedCount: 0,
      totalPrizePool: 0,
    },
    isLoading: statsLoading,
    error: statsError,
  } = useHackathonStats();

  const {
    data: upcomingData,
    isLoading: upcomingLoading,
    isFetching: fetchingMoreUpcoming,
  } = useHackathonsList("upcoming", 0, upcomingLimit);

  const {
    data: ongoingData,
    isLoading: ongoingLoading,
    isFetching: fetchingMoreOngoing,
  } = useHackathonsList("ongoing", 0, ongoingLimit);

  const {
    data: completedData,
    isLoading: completedLoading,
    isFetching: fetchingMoreCompleted,
  } = useHackathonsList("completed", 0, completedLimit);

  const loading = statsLoading || upcomingLoading || ongoingLoading || completedLoading;
  const error = statsError ? "Failed to load hackathons" : null;

  const upcomingList = upcomingData?.hackathons || [];
  const upcomingTotal = upcomingData?.total || 0;

  const ongoingList = ongoingData?.hackathons || [];
  const ongoingTotal = ongoingData?.total || 0;

  const completedList = completedData?.hackathons || [];
  const completedTotal = completedData?.total || 0;

  const loadingMoreUpcoming = fetchingMoreUpcoming && upcomingLimit > 6;
  const loadingMoreOngoing = fetchingMoreOngoing && ongoingLimit > 6;
  const loadingMoreCompleted = fetchingMoreCompleted && completedLimit > 6;

  const handleLoadMoreUpcoming = () => {
    setUpcomingLimit((prev) => prev + 6);
  };

  const handleLoadMoreOngoing = () => {
    setOngoingLimit((prev) => prev + 6);
  };

  const handleLoadMoreCompleted = () => {
    setCompletedLimit((prev) => prev + 6);
  };

  // Categorize hackathons by status
  const upcomingHackathons = upcomingList;
  const ongoingHackathons = ongoingList;
  const previousHackathons = completedList;

  const HackathonCard = ({ hackathon }: { hackathon: any }) => {
    const getStatusGradient = (status: string) => {
      switch (status) {
        case "upcoming": return "from-blue-600 to-purple-600";
        case "ongoing": return "from-green-600 to-emerald-600";
        case "completed": return "from-gray-600 to-slate-600";
        case "cancelled": return "from-red-600 to-pink-600";
        default: return "from-gray-600 to-slate-600";
      }
    };

    const getStatusBg = (status: string) => {
      switch (status) {
        case "upcoming": return "bg-blue-600/10 text-blue-600 dark:text-blue-400";
        case "ongoing": return "bg-green-600/10 text-green-600 dark:text-green-400";
        case "completed": return "bg-gray-600/10 text-gray-600 dark:text-gray-400";
        case "cancelled": return "bg-red-600/10 text-red-600 dark:text-red-400";
        default: return "bg-gray-600/10 text-gray-600 dark:text-gray-400";
      }
    };

    return (
      <div className="glass rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl group relative overflow-hidden">
        {/* Background Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getStatusGradient(hackathon.status)} opacity-0 group-hover:opacity-5 transition-all duration-300 rounded-2xl`} />

        <div className="relative z-10 space-y-4">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <h3 className="text-lg font-bold group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300 line-clamp-2 font-space-grotesk">
                {hackathon.name}
              </h3>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBg(hackathon.status)} backdrop-blur-sm border border-current/20`}>
                {hackathon.status}
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {hackathon.description}
            </p>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 dark:bg-white/5">
              <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <div className="flex flex-col">
                {hackathon.status === 'upcoming' ? (
                  <>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Registration Ends</span>
                    <span className="truncate font-semibold">{hackathon.startDate || "TBD"}</span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Submission Ends</span>
                    <span className="truncate font-semibold">{hackathon.endDate || "TBD"}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 dark:bg-white/5">
              <MapPin className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="truncate">{hackathon.location}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 dark:bg-white/5">
              <Clock className="h-4 w-4 text-purple-500 flex-shrink-0" />
              <span className="truncate">{hackathon.category}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 dark:bg-white/5">
              <Users className="h-4 w-4 text-orange-500 flex-shrink-0" />
              <span className="truncate">Individual Only</span>
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-600/10 to-blue-600/10 text-purple-600 dark:text-purple-400 border border-purple-600/20 w-fit">
              {hackathon.category}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button asChild className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href={`/hackathons/${hackathon.id}`}>
                View Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            {hackathon.registrationLink && (hackathon.status === 'upcoming' || hackathon.status === 'ongoing') && (
              <Button asChild variant="outline" className="flex-1 sm:flex-none glass border-blue-600/30 hover:bg-blue-600/10 hover:border-blue-600/50 transition-all duration-300">
                <Link href={hackathon.registrationLink} target="_blank" rel="noopener noreferrer">
                  Event Info
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-400 font-medium">Loading hackathons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-center p-8 glass rounded-2xl max-w-md">
          <h2 className="text-2xl font-bold text-red-500 font-space-grotesk mb-2">Notice</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5" />
        <div className="container relative z-10 px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-space-grotesk leading-tight">
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">Hackathons</span>
                <br />
                <span className="text-gray-900 dark:text-white">& Competitions</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-lg md:text-xl text-muted-foreground leading-relaxed">
                Join our exciting hackathons and coding competitions. Build innovative solutions, learn new technologies, and compete for amazing prizes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/20">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Events */}
            <div className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl group">
              <div className="relative mb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 flex items-center justify-center mb-3 group-hover:from-purple-600/30 group-hover:to-blue-600/30 transition-all duration-300">
                  <Trophy className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/10 to-blue-600/10 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {stats.totalCount}
              </div>
              <p className="text-sm font-medium text-muted-foreground">Total Events</p>
            </div>

            {/* Upcoming Events */}
            <div className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl group">
              <div className="relative mb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20 flex items-center justify-center mb-3 group-hover:from-blue-600/30 group-hover:to-cyan-600/30 transition-all duration-300">
                  <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/10 to-cyan-600/10 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {stats.upcomingCount}
              </div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
            </div>

            {/* Total Participants */}
            <div className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl group">
              <div className="relative mb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 flex items-center justify-center mb-3 group-hover:from-green-600/30 group-hover:to-emerald-600/30 transition-all duration-300">
                  <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-600/10 to-emerald-600/10 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                {stats.ongoingCount}
              </div>
              <p className="text-sm font-medium text-muted-foreground">Ongoing</p>
            </div>

            {/* Completed Events */}
            <div className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl group">
              <div className="relative mb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-gray-600/20 to-slate-600/20 flex items-center justify-center mb-3 group-hover:from-gray-600/30 group-hover:to-slate-600/30 transition-all duration-300">
                  <CheckCircle className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-600/10 to-slate-600/10 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent mb-2">
                {stats.completedCount}
              </div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Hackathons */}
      {upcomingList.length > 0 && (
        <section className="py-16 md:py-20 lg:py-24">
          <div className="container px-4 md:px-6">
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 mb-4">
                  <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-space-grotesk">
                  Upcoming <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Events</span>
                </h2>
                <p className="mx-auto max-w-[600px] text-lg text-muted-foreground leading-relaxed">
                  Don't miss out on these exciting upcoming hackathons and competitions
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingHackathons.map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </div>
              {upcomingList.length < upcomingTotal && (
                <div className="text-center pt-6">
                  <Button 
                    onClick={handleLoadMoreUpcoming} 
                    disabled={loadingMoreUpcoming}
                    variant="outline"
                    className="glass border-blue-600/30 hover:bg-blue-600/10 hover:border-blue-600/50"
                  >
                    {loadingMoreUpcoming ? "Loading..." : "Load More Upcoming Events"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Ongoing Hackathons */}
      {ongoingList.length > 0 && (
        <section className="py-16 md:py-20 lg:py-24 bg-muted/20">
          <div className="container px-4 md:px-6">
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 mb-4">
                  <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-space-grotesk">
                  Ongoing <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Events</span>
                </h2>
                <p className="mx-auto max-w-[600px] text-lg text-muted-foreground leading-relaxed">
                  These hackathons are currently in progress - join the action now!
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ongoingHackathons.map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </div>
              {ongoingList.length < ongoingTotal && (
                <div className="text-center pt-6">
                  <Button 
                    onClick={handleLoadMoreOngoing} 
                    disabled={loadingMoreOngoing}
                    variant="outline"
                    className="glass border-green-600/30 hover:bg-green-600/10 hover:border-green-600/50"
                  >
                    {loadingMoreOngoing ? "Loading..." : "Load More Ongoing Events"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Previous Hackathons */}
      {completedList.length > 0 && (
        <section className="py-16 md:py-20 lg:py-24">
          <div className="container px-4 md:px-6">
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-gray-600/20 to-purple-600/20 mb-4">
                  <Trophy className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-space-grotesk">
                  Previous <span className="bg-gradient-to-r from-gray-600 to-purple-600 bg-clip-text text-transparent">Events</span>
                </h2>
                <p className="mx-auto max-w-[600px] text-lg text-muted-foreground leading-relaxed">
                  Explore our past hackathons and their amazing outcomes
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {previousHackathons.map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </div>
              {completedList.length < completedTotal && (
                <div className="text-center pt-6">
                  <Button 
                    onClick={handleLoadMoreCompleted} 
                    disabled={loadingMoreCompleted}
                    variant="outline"
                    className="glass border-purple-600/30 hover:bg-purple-600/10 hover:border-purple-600/50"
                  >
                    {loadingMoreCompleted ? "Loading..." : "Load More Previous Events"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {upcomingList.length === 0 && ongoingList.length === 0 && completedList.length === 0 && (
        <section className="py-16 md:py-20 lg:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6 max-w-2xl mx-auto">
              <div className="glass rounded-2xl p-12">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 flex items-center justify-center mb-6">
                  <Trophy className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold font-space-grotesk">No Hackathons Found</h3>
                <p className="text-muted-foreground">
                  We are currently planning next semester's hackathons. Keep an eye on this space for updates!
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
