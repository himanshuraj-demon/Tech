"use client";

import React, { useState } from "react";
import { Trophy, Award, Calendar, ChevronDown, ChevronUp, Star, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLeaderboard } from "@/lib/queries";

interface LeaderboardItem {
  email: string;
  name: string;
  score: number;
  participations: number;
  firstPlaces: number;
  secondPlaces: number;
  thirdPlaces: number;
  events: Array<{
    id: string;
    title: string;
    place: number | null;
    placeName?: string | null;
    points: number;
  }>;
}

export default function LeaderboardPage() {
  const { data: leaderboard = [], isLoading: loading, error } = useLeaderboard();
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(20);

  const visibleLeaderboard = (leaderboard as LeaderboardItem[]).slice(0, visibleCount);

  const toggleUserExpand = (email: string) => {
    setExpandedUsers(prev => ({
      ...prev,
      [email]: !prev[email]
    }));
  };

  const getRankBadge = (studentScore: number, index: number) => {
    const uniqueScoresAbove = Array.from(
      new Set(leaderboard.map((item: any) => item.score))
    ).filter((score: number) => score > studentScore);
    const finalRank = uniqueScoresAbove.length;
    switch (finalRank) {
      case 0:
        return <span className="text-2xl text-orange-300">#1</span>;
      case 1:
        return <span className="text-2xl text-gray-400">#2</span>;
      case 2:
        return <span className="text-2xl text-amber-800">#3</span>;
      default:
        return <span className="font-bold text-gray-500">#{finalRank + 1}</span>;
    }
  };

  const formatEmail = (email: string) => {
    const [local, domain] = email.split("@");
    if (local.length <= 3) return email;
    return `${local.substring(0, 3)}...@${domain}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950 font-sans">

      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2 text-primary">
              <Trophy className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-space-grotesk">
              Student <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">Leaderboard</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
              Participate in Technical Council events, win challenges, and accumulate points to climb the leaderboard ranking.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-muted-foreground font-medium">Compiling scores and rankings...</p>
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl max-w-md mx-auto">
              <p className="text-red-600 dark:text-red-400 font-medium">Failed to load leaderboard data. Please try again later.</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-20 max-w-md mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 shadow-sm">
              <Trophy className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-xl font-bold mb-2">No scores recorded yet</h3>
              <p className="text-muted-foreground">
                Once students participate in events and winners are assigned, the rankings will appear here!
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Table Rankings */}
              <Card className="max-w-4xl mx-auto border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <th className="px-3 py-4 md:px-6 text-center w-16 md:w-20">Rank</th>
                          <th className="px-3 py-4 md:px-6">Student</th>
                          <th className="px-6 py-4 text-center hidden md:table-cell">Events Participated</th>
                          <th className="px-3 py-4 md:px-6 text-right">Total Score</th>
                          <th className="px-3 py-4 md:px-6 text-center w-16 md:w-20">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {visibleLeaderboard.map((student, idx) => {
                          const isExpanded = !!expandedUsers[student.email];
                          
                          // Shared dense ranking for tied scores
                          const uniqueScoresAbove = Array.from(
                            new Set(leaderboard.map((item: any) => item.score))
                          ).filter((score: number) => score > student.score);
                          const finalRank = uniqueScoresAbove.length;
                          
                          // Style variables based on rank (1st, 2nd, 3rd vs general)
                          let rowClass = "border-l-4 border-l-transparent hover:bg-gray-50/50 dark:hover:bg-gray-850/30";
                          let nameClass = "font-semibold text-gray-900 dark:text-gray-100 text-sm md:text-base";
                          let scoreClass = "text-primary text-base md:text-lg font-extrabold";
                          
                          if (finalRank === 0) {
                            rowClass = "border-l-4 border-l-amber-500 bg-amber-500/[0.03] dark:bg-amber-500/[0.06] hover:bg-amber-500/[0.06] dark:hover:bg-amber-500/[0.10]";
                            nameClass = "font-extrabold text-amber-900 dark:text-amber-400 text-base md:text-lg";
                            scoreClass = "text-amber-600 dark:text-amber-400 text-lg md:text-xl font-black";
                          } else if (finalRank === 1) {
                            rowClass = "border-l-4 border-l-slate-400 dark:border-l-slate-500 bg-slate-500/[0.03] dark:bg-slate-500/[0.06] hover:bg-slate-500/[0.06] dark:hover:bg-slate-500/[0.10]";
                            nameClass = "font-bold text-slate-800 dark:text-slate-300 text-sm md:text-base";
                            scoreClass = "text-slate-650 dark:text-slate-400 text-base md:text-lg font-extrabold";
                          } else if (finalRank === 2) {
                            rowClass = "border-l-4 border-l-orange-400 dark:border-l-orange-500 bg-orange-500/[0.03] dark:bg-orange-500/[0.06] hover:bg-orange-500/[0.06] dark:hover:bg-orange-500/[0.10]";
                            nameClass = "font-bold text-orange-850 dark:text-orange-400 text-sm md:text-base";
                            scoreClass = "text-orange-600 dark:text-orange-400 text-base md:text-lg font-extrabold";
                          }
                          
                          return (
                            <React.Fragment key={student.email}>
                              <tr className={cn("transition-colors duration-150", rowClass)}>
                                <td className="px-3 py-4 md:px-6 text-center align-middle">
                                  {getRankBadge(student.score, idx)}
                                </td>
                                <td className="px-3 py-4 md:px-6 align-middle">
                                  <div>
                                    <div className={nameClass}>{student.name}</div>
                                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-1.5 mt-0.5">
                                      <span>{formatEmail(student.email)}</span>
                                      <Badge variant="secondary" className="md:hidden text-[10px] px-1.5 py-0 bg-gray-200/50 dark:bg-gray-800/50 border-0">
                                        {student.participations} {student.participations === 1 ? 'event' : 'events'}
                                      </Badge>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center align-middle font-medium hidden md:table-cell">
                                  {student.participations}
                                </td>
                                <td className={cn("px-3 py-4 md:px-6 text-right align-middle", scoreClass)}>
                                  {student.score} pts
                                </td>
                                <td className="px-3 py-4 md:px-6 text-center align-middle">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleUserExpand(student.email)}
                                    className="h-8 w-8 rounded-full"
                                  >
                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  </Button>
                                </td>
                              </tr>
                              
                              {/* Expanded View (Event Breakdown) */}
                              {isExpanded && (
                                <tr className="bg-gray-50/40 dark:bg-gray-900/40">
                                  <td colSpan={5} className="px-4 py-4 md:px-8">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Points Breakdown</div>
                                    <div className="grid gap-2">
                                      {student.events.map((e, evIdx) => (
                                        <div key={evIdx} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950/60 shadow-sm text-sm gap-2">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                            <span className="font-medium text-gray-700 dark:text-gray-300 break-all">{e.title}</span>
                                            {e.place && (
                                               <Badge className={
                                                 e.place === 1 ? "bg-yellow-500 text-white hover:bg-yellow-600" :
                                                 e.place === 2 ? "bg-slate-400 text-white hover:bg-slate-500" :
                                                 e.place === 3 ? "bg-amber-700 text-white hover:bg-amber-800" :
                                                 "bg-emerald-600 text-white hover:bg-emerald-750"
                                               }>
                                                 {e.placeName || `${e.place} Place`}
                                               </Badge>
                                             )}
                                          </div>
                                          <div className="font-bold text-green-600 dark:text-green-400 flex items-center gap-1 self-end sm:self-auto">
                                            <Star className="h-3 w-3 fill-current" />
                                            +{e.points} pts
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {visibleCount < leaderboard.length && (
                <div className="flex justify-center mt-6">
                  <Button 
                    onClick={() => setVisibleCount(prev => prev + 20)}
                    variant="outline"
                    className="glass border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    Load More Rankings
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
