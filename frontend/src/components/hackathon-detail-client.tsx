"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ExternalLink, 
  ArrowLeft,
  CheckCircle,
  LogIn,
  Plus,
  Trash2,
  Award,
  Trophy,
  Github
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "../../services/api";
import { useSession, signIn } from "next-auth/react";

interface HackathonDetailClientProps {
  id: string;
}

export function HackathonDetailClient({ id }: HackathonDetailClientProps) {
  const [hackathon, setHackathon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Auth & registration states
  const { data: session, status: authStatus } = useSession();
  const [isRegistered, setIsRegistered] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [submittingReg, setSubmittingReg] = useState(false);
  
  // Form fields
  const [degreeType, setDegreeType] = useState("btech");
  const [yearOfJoining, setYearOfJoining] = useState("2025");
  const [branchName, setBranchName] = useState("");
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [newTeamMember, setNewTeamMember] = useState("");

  // Project submission states
  const [githubLink, setGithubLink] = useState("");
  const [docsLink, setDocsLink] = useState("");
  const [submittingProject, setSubmittingProject] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  useEffect(() => {
    async function fetchHackathon() {
      try {
        setLoading(true);
        setError(false);
        const res = await api.fetch(`/api/hackathons/${id}`);
        if (res.status === 404) {
          setError(true);
          return;
        }
        if (!res.ok) {
          throw new Error("Failed to fetch hackathon");
        }
        const data = await res.json();
        setHackathon(data);
      } catch (err) {
        console.error("Error fetching hackathon details:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchEventAndRegistration();

    async function fetchEventAndRegistration() {
      await fetchHackathon();
    }
  }, [id]);

  useEffect(() => {
    async function checkRegistration() {
      if (authStatus === "authenticated" && hackathon) {
        try {
          setCheckingStatus(true);
          const res = await api.fetch(`/api/hackathons/${id}/registration-status`);
          if (res.ok) {
            const data = await res.json();
            if (data.registered) {
              setIsRegistered(true);
              setDegreeType(data.registration.degreeType);
              setYearOfJoining(data.registration.yearOfJoining);
              setBranchName(data.registration.branchName);
              setTeamMembers(data.registration.teamMembers || []);
              setGithubLink(data.registration.githubLink || "");
              setDocsLink(data.registration.docsLink || "");
            }
          }
        } catch (err) {
          console.error("Error checking registration status:", err);
        } finally {
          setCheckingStatus(false);
        }
      } else {
        setCheckingStatus(false);
      }
    }
    checkRegistration();
  }, [id, authStatus, hackathon]);

  const addTeamMember = () => {
    if (newTeamMember.trim()) {
      setTeamMembers([...teamMembers, newTeamMember.trim()]);
      setNewTeamMember("");
    }
  };

  const removeTeamMember = (idx: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== idx));
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProject(true);
    setSubmissionSuccess(false);
    setSubmissionError("");
    try {
      const res = await api.fetch(`/api/hackathons/${id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ githubLink, docsLink }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit project");
      }
      setSubmissionSuccess(true);
    } catch (err) {
      console.error("Error submitting project:", err);
      setSubmissionError(err instanceof Error ? err.message : "Failed to submit project");
    } finally {
      setSubmittingProject(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmittingReg(true);
      const res = await api.fetch(`/api/hackathons/${id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        setIsRegistered(true);
        alert("Registered successfully for " + hackathon.name + "! 🎉");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to register.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting registration.");
    } finally {
      setSubmittingReg(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-400 font-medium">Loading hackathon details...</p>
        </div>
      </div>
    );
  }

  if (error || !hackathon) {
    notFound();
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "ongoing": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "completed": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="flex flex-col font-sans w-full">
      {/* Header */}
      <section className="py-12 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="space-y-6">
            <Button asChild variant="ghost" className="w-fit">
              <Link href="/hackathons">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Hackathons
              </Link>
            </Button>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold tracking-tighter font-space-grotesk">
                  {hackathon.name}
                </h1>
                <Badge className={getStatusColor(hackathon.status)}>
                  {hackathon.status}
                </Badge>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl">
                {hackathon.description}
              </p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Registration Ends</p>
                  <p className="font-medium">
                    {hackathon.startDate || "TBD"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Submission Ends</p>
                  <p className="font-medium">
                    {hackathon.endDate || "TBD"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{hackathon.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{hackathon.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Team Size</p>
                  <p className="font-medium">Individual Only</p>
                </div>
              </div>
            </div>

            {/* Registration Action Button */}
            {!hackathon.draft && (hackathon.status === 'upcoming' || hackathon.status === 'ongoing') && (
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Button 
                  onClick={() => document.getElementById('registration-section')?.scrollIntoView({ behavior: 'smooth' })}
                  size="lg" 
                  className="w-fit"
                >
                  {isRegistered ? 'View Confirmation' : 'Register Now'}
                </Button>
                {hackathon.status === 'ongoing' && (
                  <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 mt-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    <span className="font-medium">Hackathon is currently ongoing!</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle>About the Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {hackathon.longDescription}
                  </p>
                </CardContent>
              </Card>

              {/* Themes/Tracks */}
              {hackathon.themes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Themes & Tracks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {hackathon.themes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Requirements & Eligibility */}
              {(hackathon.eligibility || hackathon.requirements) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements & Eligibility</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {hackathon.eligibility && (
                      <div>
                        <h4 className="font-semibold mb-2">Eligibility Criteria</h4>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {hackathon.eligibility}
                        </p>
                      </div>
                    )}
                    {hackathon.requirements && (
                      <div>
                        <h4 className="font-semibold mb-2">Technical Requirements</h4>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {hackathon.requirements}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Timeline */}
              {hackathon.timeline && (
                <Card>
                  <CardHeader>
                    <CardTitle>Event Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {hackathon.timeline}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Submission Guidelines */}
              {hackathon.submissionGuidelines && (
                <Card className="border-gray-200 dark:border-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ExternalLink className="h-5 w-5 text-blue-500" />
                      Submission Guidelines
                    </CardTitle>
                    <CardDescription>Follow these guidelines when submitting your project</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {hackathon.submissionGuidelines}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Judging Criteria */}
              {hackathon.judingCriteria && (
                <Card className="border-purple-200/50 dark:border-purple-900/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-500" />
                      Judging Criteria
                    </CardTitle>
                    <CardDescription>How your project will be evaluated</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {hackathon.judingCriteria}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Important Notes */}
              {hackathon.importantNotes && (
                <Card className="border-orange-200/50 dark:border-orange-900/30 bg-orange-50/30 dark:bg-orange-950/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      Important Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-orange-800 dark:text-orange-300 leading-relaxed whitespace-pre-line">
                      {hackathon.importantNotes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Event Winners Section (Only visible when completed & winners declared) */}
              {hackathon.status === 'completed' && hackathon.winners && hackathon.winners.length > 0 && (
                <Card className="border-yellow-200/50 dark:border-yellow-900/30 bg-gradient-to-b from-yellow-50/10 to-transparent dark:from-yellow-950/5">
                  <CardHeader className="text-center">
                    <CardTitle className="flex justify-center items-center gap-2 text-2xl font-bold font-space-grotesk text-yellow-600 dark:text-yellow-400">
                      <Trophy className="h-6 w-6" />
                      Event Winners 🏆
                    </CardTitle>
                    <CardDescription>Congratulations to the winners of {hackathon.name}!</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {hackathon.winners.map((winner: any) => {
                        const rankPrefix = 
                          winner.winnerPlace === 1 ? "🥇 1st Place" :
                          winner.winnerPlace === 2 ? "🥈 2nd Place" :
                          winner.winnerPlace === 3 ? "🥉 3rd Place" :
                          `🏆 Winner`;
                        
                        const tier = hackathon.winnerTiers?.find((t: any) => t.rank === winner.winnerPlace);
                        const tierName = tier ? tier.name : rankPrefix;
                        const pointsAwarded = tier ? tier.points : 0;

                        return (
                          <Card key={winner.id} className="relative overflow-hidden border-yellow-150 dark:border-yellow-900/20 bg-white/50 dark:bg-neutral-900/40 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="absolute top-0 right-0 left-0 h-1 bg-yellow-500" />
                            <CardHeader className="pb-3 text-center">
                              <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">{tierName}</span>
                              <CardTitle className="text-lg font-bold font-space-grotesk mt-1">{winner.userName}</CardTitle>
                              <CardDescription className="text-xs text-muted-foreground">{winner.userEmail}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0 text-center flex flex-col items-center">
                              {pointsAwarded > 0 && (
                                <Badge variant="secondary" className="bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border border-yellow-250/50">
                                  +{pointsAwarded} Leaderboard Points
                                </Badge>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Dynamic Registration Section */}
              {!hackathon.draft && (hackathon.status === 'upcoming' || hackathon.status === 'ongoing') && (
                <div id="registration-section" className="scroll-mt-6 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 backdrop-blur shadow-sm">
                  <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl font-space-grotesk mb-2 text-center">
                    Hackathon Registration
                  </h2>
                  <p className="text-muted-foreground text-center mb-8 text-sm">
                    Register to participate and build cool projects!
                  </p>

                  {checkingStatus ? (
                    <div className="flex justify-center items-center py-6 gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                      <span className="text-sm text-muted-foreground">Checking registration status...</span>
                    </div>
                  ) : isRegistered ? (
                    // Confirm confirmation
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center text-green-600">
                        <CheckCircle className="w-10 h-10" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Registered Successfully!</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          You are registered for this hackathon. Get ready to hack!
                        </p>
                      </div>


                      {/* Project Submission Form for ongoing hackathons */}
                      {(hackathon.status === 'ongoing' || hackathon.status === 'upcoming') && (
                        <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl mt-6 shadow-md text-left space-y-4">
                          <h4 className="text-lg font-bold font-space-grotesk text-neutral-900 dark:text-neutral-100 flex items-center gap-2 border-b pb-2 dark:border-neutral-850">
                            <Award className="h-5 w-5 text-primary" />
                            Project Submission
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Submit or update your repository and documentation links here. This form is only active during ongoing events.
                          </p>
                          
                          <form onSubmit={handleProjectSubmit} className="space-y-4">
                            <div>
                              <Label htmlFor="githubLink" className="text-xs font-semibold text-neutral-800 dark:text-neutral-250">GitHub Repository URL</Label>
                              <Input
                                id="githubLink"
                                value={githubLink}
                                onChange={(e) => setGithubLink(e.target.value)}
                                placeholder="e.g. https://github.com/myusername/myproject"
                                className="mt-1 border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-gray-500"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="docsLink" className="text-xs font-semibold text-neutral-800 dark:text-neutral-250">Submission Docs Link</Label>
                              <Input
                                id="docsLink"
                                value={docsLink}
                                onChange={(e) => setDocsLink(e.target.value)}
                                placeholder="e.g. Google Drive PDF, Notion Doc, or Loom Video"
                                className="mt-1 border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-gray-500"
                              />
                            </div>

                            {submissionSuccess && (
                              <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5" /> Project submission links saved successfully!
                              </p>
                            )}

                            {submissionError && (
                              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                {submissionError}
                              </p>
                            )}

                            <Button 
                              type="submit" 
                              disabled={submittingProject}
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            >
                              {submittingProject ? "Saving Submission..." : "Save Submission Links"}
                            </Button>
                          </form>
                        </div>
                      )}
                    </div>
                  ) : authStatus !== "authenticated" ? (
                    // Needs login
                    <div className="text-center py-8 space-y-4">
                      <div className="inline-flex p-3 bg-blue-50 dark:bg-blue-950/20 rounded-full text-blue-600 dark:text-blue-400">
                        <LogIn className="h-8 w-8" />
                      </div>
                      <div className="max-w-sm mx-auto">
                        <h3 className="font-semibold text-lg">Sign in to Register</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Students must sign in using their institute Google account to register for technical council hackathons.
                        </p>
                      </div>
                      <Button
                        onClick={() => signIn("google", { callbackUrl: window.location.href })}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-md border-0 rounded-full px-6 py-2"
                      >
                        Sign In with Google
                      </Button>
                    </div>
                  ) : (
                    // Registration Form (Simple direct button)
                    <form onSubmit={handleRegister} className="space-y-6 max-w-md mx-auto">
                      <div className="text-center p-4 bg-blue-50/50 dark:bg-blue-950/10 rounded-xl border border-blue-150/20">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          You will be registered as <span className="font-semibold text-gray-800 dark:text-gray-200">{session?.user?.name}</span> ({session?.user?.email}).
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={submittingReg}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-xl shadow-md border-0"
                      >
                        {submittingReg ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            <span>Registering...</span>
                          </div>
                        ) : (
                          <span>Confirm & Register</span>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration/Join Action Box */}
              {!hackathon.draft && (hackathon.status === 'upcoming' || hackathon.status === 'ongoing') && (
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {hackathon.status === 'upcoming' ? (
                        <>
                          <Calendar className="h-5 w-5 text-primary" />
                          Registration Open
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                          Join Live Event
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {hackathon.status === 'ongoing' && (
                      <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                        🔴 Event is currently live! Join now to participate.
                      </div>
                    )}
                    <Button 
                      onClick={() => document.getElementById('registration-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full" 
                      size="lg"
                    >
                      {isRegistered ? 'View Registration' : 'Register Now'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <Badge variant="outline">{hackathon.category}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {hackathon.startDate && hackathon.endDate 
                        ? `${hackathon.startDate} to ${hackathon.endDate}`
                        : hackathon.startDate || hackathon.endDate || "TBD"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{hackathon.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Team Size</p>
                    <p className="font-medium">{hackathon.teamSize || "Individual or Team (TBA)"}</p>
                  </div>
                  {hackathon.registrationLink && (
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                      <Button asChild variant="outline" className="w-full flex items-center gap-2 justify-center">
                        <Link href={hackathon.registrationLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          Download Event Info (PDF)
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Organizer Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Organizers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Organizer</p>
                    <p className="font-medium">{hackathon.organizerName || "Technical Council"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    {hackathon.organizerEmail ? (
                      <Link 
                        href={`mailto:${hackathon.organizerEmail}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {hackathon.organizerEmail}
                      </Link>
                    ) : (
                      <p className="font-medium text-muted-foreground">Contact details will be shared soon</p>
                    )}
                  </div>
                  {hackathon.organizerPhone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <Link 
                        href={`tel:${hackathon.organizerPhone}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {hackathon.organizerPhone}
                      </Link>
                    </div>
                  )}
                  {hackathon.organizerWebsite && (
                    <div>
                      <p className="text-sm text-muted-foreground">Website</p>
                      <Link 
                        href={hackathon.organizerWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        Visit Website
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
