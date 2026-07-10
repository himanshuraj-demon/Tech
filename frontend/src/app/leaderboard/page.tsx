"use client";

import React, { useEffect, useState } from "react";
import { Trophy, Award, Calendar, ChevronDown, ChevronUp, Star, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../../services/api";

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
    points: number;
  }>;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        setError(null);
        // Fetch from API
        const data = await api.get<LeaderboardItem[]>("/api/leaderboard");
        setLeaderboard(data);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const toggleUserExpand = (email: string) => {
    setExpandedUsers(prev => ({
      ...prev,
      [email]: !prev[email]
    }));
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <span className="text-2xl">🥇</span>;
      case 1:
        return <span className="text-2xl">🥈</span>;
      case 2:
        return <span className="text-2xl">🥉</span>;
      default:
        return <span className="font-bold text-gray-500">#{index + 1}</span>;
    }
  };

  const formatEmail = (email: string) => {
    const [local, domain] = email.split("@");
    if (local.length <= 3) return email;
    return `${local.substring(0, 3)}...@${domain}`;
  };

  // Get podium users
  const podium = leaderboard.slice(0, 3);
  const listUsers = leaderboard.slice(3);

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
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
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
              {/* Podium View */}
              {podium.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-6">
                  {/* 2nd Place */}
                  {podium[1] && (
                    <Card className="relative order-2 md:order-1 border-gray-200/80 dark:border-gray-800/80 bg-white/50 dark:bg-gray-900/50 backdrop-blur shadow-md md:mt-6 hover:scale-105 transition-all duration-300">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xl border-4 border-gray-50 dark:border-gray-950 font-bold shadow-md">🥈</div>
                      <CardHeader className="text-center pt-8 pb-3">
                        <CardTitle className="font-space-grotesk text-lg truncate">{podium[1].name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{formatEmail(podium[1].email)}</p>
                      </CardHeader>
                      <CardContent className="text-center pb-6">
                        <div className="text-3xl font-extrabold text-slate-600 dark:text-slate-400 mb-2">{podium[1].score} pts</div>
                        <Badge variant="secondary" className="text-xs">{podium[1].participations} Events</Badge>
                      </CardContent>
                    </Card>
                  )}

                  {/* 1st Place */}
                  {podium[0] && (
                    <Card className="relative order-1 md:order-2 border-primary/30 dark:border-primary/20 bg-gradient-to-b from-primary/5 to-white dark:to-gray-900 shadow-xl scale-105 z-10 hover:scale-110 transition-all duration-300">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center text-3xl border-4 border-gray-50 dark:border-gray-950 font-bold shadow-lg animate-bounce">🥇</div>
                      <CardHeader className="text-center pt-10 pb-3">
                        <CardTitle className="font-space-grotesk text-xl truncate">{podium[0].name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{formatEmail(podium[0].email)}</p>
                      </CardHeader>
                      <CardContent className="text-center pb-8">
                        <div className="text-4xl font-extrabold text-amber-500 mb-3">{podium[0].score} pts</div>
                        <div className="flex gap-2 justify-center">
                          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-[10px]">Leader</Badge>
                          <Badge variant="outline" className="text-xs">{podium[0].participations} Events</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 3rd Place */}
                  {podium[2] && (
                    <Card className="relative order-3 md:order-3 border-gray-200/80 dark:border-gray-800/80 bg-white/50 dark:bg-gray-900/50 backdrop-blur shadow-md md:mt-8 hover:scale-105 transition-all duration-300">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-amber-700/10 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 flex items-center justify-center text-xl border-4 border-gray-50 dark:border-gray-950 font-bold shadow-md">🥉</div>
                      <CardHeader className="text-center pt-8 pb-3">
                        <CardTitle className="font-space-grotesk text-lg truncate">{podium[2].name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{formatEmail(podium[2].email)}</p>
                      </CardHeader>
                      <CardContent className="text-center pb-6">
                        <div className="text-3xl font-extrabold text-amber-700 dark:text-amber-600 mb-2">{podium[2].score} pts</div>
                        <Badge variant="secondary" className="text-xs">{podium[2].participations} Events</Badge>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Table Rankings */}
              <Card className="max-w-4xl mx-auto border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <th className="px-6 py-4 text-center w-20">Rank</th>
                          <th className="px-6 py-4">Student</th>
                          <th className="px-6 py-4 text-center">Events Participated</th>
                          <th className="px-6 py-4 text-right">Total Score</th>
                          <th className="px-6 py-4 text-center w-20">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {leaderboard.map((student, idx) => {
                          const isExpanded = !!expandedUsers[student.email];
                          return (
                            <React.Fragment key={student.email}>
                              <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-850/30 transition-colors duration-150">
                                <td className="px-6 py-4 text-center align-middle">
                                  {getRankBadge(idx)}
                                </td>
                                <td className="px-6 py-4 align-middle">
                                  <div>
                                    <div className="font-bold text-gray-900 dark:text-gray-100">{student.name}</div>
                                    <div className="text-xs text-muted-foreground">{formatEmail(student.email)}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center align-middle font-medium">
                                  {student.participations}
                                </td>
                                <td className="px-6 py-4 text-right align-middle font-extrabold text-lg text-primary">
                                  {student.score} pts
                                </td>
                                <td className="px-6 py-4 text-center align-middle">
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
                                  <td colSpan={5} className="px-8 py-4">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Points Breakdown</div>
                                    <div className="grid gap-2">
                                      {student.events.map((e, evIdx) => (
                                        <div key={evIdx} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950/60 shadow-sm text-sm">
                                          <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{e.title}</span>
                                            {e.place && (
                                              <Badge className={
                                                e.place === 1 ? "bg-yellow-500 text-white hover:bg-yellow-600" :
                                                e.place === 2 ? "bg-slate-400 text-white hover:bg-slate-500" :
                                                "bg-amber-700 text-white hover:bg-amber-800"
                                              }>
                                                {e.place === 1 ? "1st Place" : e.place === 2 ? "2nd Place" : "3rd Place"}
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
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
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
