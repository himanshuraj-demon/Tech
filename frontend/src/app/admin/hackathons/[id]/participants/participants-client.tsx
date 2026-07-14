"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Loader2, Trophy, ArrowLeft, Save, Users, AlertCircle, Calendar, UserCheck, ExternalLink, Github, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../../../../../services/api";

interface Registration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  degreeType: string;
  yearOfJoining: string;
  branchName: string;
  teamMembers: string[] | null;
  winnerPlace: number | null;
  githubLink: string | null;
  docsLink: string | null;
  createdAt: string;
}

interface ParticipantsClientProps {
  hackathonId: string;
}

export default function ParticipantsClient({ hackathonId }: ParticipantsClientProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hackathon, setHackathon] = useState<any>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [visibleCount, setVisibleCount] = useState(20);
  
  const visibleRegistrations = registrations.slice(0, visibleCount);
  
  // Winners selection: maps rank to registrationId
  const [winnerSelections, setWinnerSelections] = useState<Record<number, string>>({});

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.isAdmin) {
      router.push("/admin/login");
      return;
    }
    if (hackathonId) {
      fetchHackathonAndParticipants();
    }
  }, [session, status, router, hackathonId]);

  const fetchHackathonAndParticipants = async () => {
    try {
      setIsLoading(true);
      
      // Fetch Hackathon details
      const response = await api.fetch(`/api/admin/hackathons/${hackathonId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch hackathon details");
      }
      const hackathonData = await response.json();
      setHackathon(hackathonData);

      // Fetch Registrations
      const regResponse = await api.fetch(`/api/admin/hackathons/${hackathonId}/registrations`);
      if (!regResponse.ok) {
        throw new Error("Failed to fetch registrations");
      }
      const regData = await regResponse.json();
      setRegistrations(regData);

      // Set initial winner placements from registrations data
      const initialSelections: Record<number, string> = {};
      regData.forEach((r: Registration) => {
        if (r.winnerPlace) {
          initialSelections[r.winnerPlace] = r.id;
        }
      });
      setWinnerSelections(initialSelections);

    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load hackathon participants");
      router.push("/admin/hackathons");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWinners = async () => {
    const selectedIds = Object.values(winnerSelections).filter(id => id !== "");
    const hasDuplicates = new Set(selectedIds).size !== selectedIds.length;
    if (hasDuplicates) {
      alert("A participant cannot win multiple prizes!");
      return;
    }
 
    try {
      setIsSaving(true);
      
      const placements = Object.entries(winnerSelections)
        .filter(([_, regId]) => regId !== "")
        .map(([rankStr, regId]) => ({
          regId,
          rank: Number(rankStr),
        }));
 
      const response = await api.fetch(`/api/admin/hackathons/${hackathonId}/winners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placements }),
      });
 
      if (!response.ok) {
        throw new Error("Failed to save winners");
      }
 
      alert("Winners updated and leaderboard points distributed successfully! 🏆");
      fetchHackathonAndParticipants(); // Refresh list
    } catch (error) {
      console.error("Error saving winners:", error);
      alert("Failed to save winners.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportToCSV = () => {
    // 1. Define CSV headers
    const headers = [
      "Student Name",
      "Student Email",
      "Degree Type",
      "Branch Name",
      "Year of Joining",
      "Team Members",
      "Winner Place",
      "GitHub Repo Link",
      "Submission Docs Link",
      "Registration Date"
    ];

    // 2. Map registrations to CSV rows
    const rows = registrations.map(reg => {
      const teamMembersStr = reg.teamMembers && reg.teamMembers.length > 0 
        ? reg.teamMembers.join("; ") 
        : "Individual";
      
      let winnerStatus = "Participant";
      if (reg.winnerPlace === 1) winnerStatus = "1st Place (Gold)";
      else if (reg.winnerPlace === 2) winnerStatus = "2nd Place (Silver)";
      else if (reg.winnerPlace === 3) winnerStatus = "3rd Place (Bronze)";

      return [
        reg.userName,
        reg.userEmail,
        reg.degreeType.toUpperCase(),
        reg.branchName,
        reg.yearOfJoining,
        teamMembersStr,
        winnerStatus,
        reg.githubLink || "Not Submitted",
        reg.docsLink || "Not Submitted",
        new Date(reg.createdAt).toLocaleDateString()
      ];
    });

    // 3. Helper to escape fields containing quotes or commas
    const escapeCSV = (field: any) => {
      const cleanField = (field ?? "").toString().replace(/"/g, '""');
      if (cleanField.includes(",") || cleanField.includes("\n") || cleanField.includes('"')) {
        return `"${cleanField}"`;
      }
      return cleanField;
    };

    // 4. Construct CSV string
    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map(row => row.map(escapeCSV).join(","))
    ].join("\n");

    // 5. Trigger download in browser
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${(hackathon?.name || "Hackathon").replace(/\s+/g, "_")}_Participants.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (status === "loading" || isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading participants details...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/hackathons")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold font-space-grotesk truncate max-w-xl">
                {hackathon?.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1.5 text-sm">
                <Users className="h-4 w-4 text-primary" />
                Manage hackathon participants and assign winners
              </p>
            </div>
          </div>
          {registrations.length > 0 && (
            <Button 
              onClick={handleExportToCSV} 
              variant="outline" 
              className="flex items-center gap-2 border-emerald-600/30 hover:bg-emerald-600/10 hover:border-emerald-600/50 transition-all duration-300 text-emerald-600 dark:text-emerald-400"
            >
              <Download className="h-4 w-4" />
              Export to Excel (CSV)
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Winner Selection Card */}
          <div className="space-y-6">
            <Card className="glass border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary font-space-grotesk">
                  <Trophy className="h-5 w-5" />
                  Assign Winners
                </CardTitle>
                <p className="text-xs text-muted-foreground">Select winners to trigger automatic leaderboard points allocation</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {registrations.length === 0 ? (
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    No registered participants to choose from.
                  </div>
                ) : (
                  <>
                    {hackathon?.winnerTiers && hackathon.winnerTiers.length > 0 ? (
                      hackathon.winnerTiers.map((tier: any) => {
                        const colorClass = 
                          tier.rank === 1 ? "text-yellow-600" :
                          tier.rank === 2 ? "text-slate-500" :
                          tier.rank === 3 ? "text-orange-700" :
                          "text-primary";
                        const rankPrefix = 
                          tier.rank === 1 ? "🥇 " :
                          tier.rank === 2 ? "🥈 " :
                          tier.rank === 3 ? "🥉 " :
                          "🏆 ";
 
                        return (
                          <div key={tier.rank} className="space-y-1.5">
                            <label className={`text-xs font-bold uppercase ${colorClass} flex items-center gap-1`}>
                              {rankPrefix}{tier.name} (+{tier.points} pts)
                            </label>
                            <select
                              value={winnerSelections[tier.rank] || ""}
                              onChange={(e) => setWinnerSelections(prev => ({
                                ...prev,
                                [tier.rank]: e.target.value
                              }))}
                              className="w-full flex h-10 rounded-md border border-input text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <option value="" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                                Select {tier.name} Winner
                              </option>
                              {registrations.map(r => (
                                <option key={r.id} value={r.id} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                                  {r.userName} ({r.userEmail})
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4" />
                        No winner tiers configured for this event.
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        onClick={handleSaveWinners}
                        className="w-full"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          "Saving Winners..."
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save & Allocate Points
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="glass text-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold font-space-grotesk">Points Reference</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-muted-foreground">
                {hackathon?.winnerTiers?.map((tier: any) => (
                  <div key={tier.rank} className="flex justify-between">
                    <span>{tier.name}:</span>
                    <span className="font-semibold text-primary">{tier.points} pts</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span>Participation:</span>
                  <span className="font-semibold text-primary">{hackathon?.pointsParticipation} pts</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-800 pt-1.5 mt-1.5 text-[10px]">
                  * All other participants who do not win a configured placement tier will receive participation points.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Participant List Table */}
          <div className="lg:col-span-2">
            <Card className="glass">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-space-grotesk">Registered Participants</CardTitle>
                  <p className="text-xs text-muted-foreground">Total of {registrations.length} students registered</p>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {registrations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                    <Calendar className="h-8 w-8 text-gray-400" />
                    <span className="font-medium text-sm">No registrations recorded yet</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-155 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/50 text-xs font-semibold text-muted-foreground uppercase">
                          <th className="px-4 py-3">Student Details</th>
                          <th className="px-4 py-3">Academic info</th>
                          <th className="px-4 py-3">Team details</th>
                          <th className="px-4 py-3">Submissions</th>
                          <th className="px-4 py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {visibleRegistrations.map((reg) => (
                          <tr key={reg.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/20">
                            <td className="px-4 py-3.5">
                              <div className="font-semibold text-gray-900 dark:text-gray-100">{reg.userName}</div>
                              <div className="text-xs text-muted-foreground font-mono">{reg.userEmail}</div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="capitalize font-medium">{reg.degreeType} ({reg.branchName})</div>
                              <div className="text-xs text-muted-foreground">Class of {reg.yearOfJoining}</div>
                            </td>
                            <td className="px-4 py-3.5 max-w-xs">
                              {reg.teamMembers && reg.teamMembers.length > 0 ? (
                                <div className="space-y-1">
                                  <span className="text-xs font-semibold text-muted-foreground">Members:</span>
                                  <div className="text-xs truncate" title={reg.teamMembers.join(", ")}>
                                    {reg.teamMembers.join(", ")}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">Individual</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 max-w-xs">
                              <div className="flex flex-col gap-1">
                                {reg.githubLink ? (
                                  <a 
                                    href={reg.githubLink.startsWith('http') ? reg.githubLink : `https://${reg.githubLink}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                                  >
                                    <Github className="h-3.5 w-3.5 flex-shrink-0" />
                                    GitHub Repo
                                  </a>
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">No Repo link</span>
                                )}
                                {reg.docsLink ? (
                                  <a 
                                    href={reg.docsLink.startsWith('http') ? reg.docsLink : `https://${reg.docsLink}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                                    Docs Link
                                  </a>
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">No Docs link</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-center align-middle">
                              {reg.winnerPlace ? (
                                (() => {
                                  const tier = hackathon?.winnerTiers?.find((t: any) => t.rank === reg.winnerPlace);
                                  const tierName = tier ? tier.name : `${reg.winnerPlace} Place`;
                                  const badgeClass = 
                                    reg.winnerPlace === 1 ? "bg-yellow-100 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-300" :
                                    reg.winnerPlace === 2 ? "bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-400 border-slate-300" :
                                    reg.winnerPlace === 3 ? "bg-orange-100 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border-orange-300" :
                                    "bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-300";
                                  const prefix = 
                                    reg.winnerPlace === 1 ? "🥇 " :
                                    reg.winnerPlace === 2 ? "🥈 " :
                                    reg.winnerPlace === 3 ? "🥉 " :
                                    "🏆 ";
                                  return (
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeClass}`}>
                                      {prefix}{tierName}
                                    </span>
                                  );
                                })()
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30">
                                  <UserCheck className="w-3 h-3" />
                                  Participant
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
            {visibleCount < registrations.length && (
              <div className="flex justify-center mt-4">
                <Button 
                  onClick={() => setVisibleCount(prev => prev + 20)}
                  variant="outline"
                  className="glass border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                >
                  Load More Participants
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
