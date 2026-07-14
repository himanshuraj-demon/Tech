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
  Award
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
    if (!branchName.trim() || !yearOfJoining.trim()) {
      alert("Please fill in all required fields.");
      return;
    }
    if (hackathon.teamRequired && teamMembers.length === 0) {
      alert("Please add at least one team member.");
      return;
    }

    try {
      setSubmittingReg(true);
      const res = await api.fetch(`/api/hackathons/${id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          degreeType,
          yearOfJoining,
          branchName: branchName.trim(),
          teamMembers,
        }),
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{hackathon.date}</p>
                  {(hackathon.startTime || hackathon.endTime) && (
                    <p className="text-sm text-muted-foreground">
                      {hackathon.startTime && hackathon.endTime 
                        ? `${hackathon.startTime} - ${hackathon.endTime}`
                        : hackathon.startTime || hackathon.endTime}
                    </p>
                  )}
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
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{hackathon.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Team Size</p>
                  <p className="font-medium">{hackathon.teamSize || "Open"}</p>
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

              {/* Prize Pool & Leaderboard points */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Prizes & Points</span>
                    {(hackathon.points1st > 0 || hackathon.pointsParticipation > 0) && (
                      <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 px-2 py-1 rounded">
                        Leaderboard Points Active
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">🥇</div>
                      <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">First Prize</h4>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">{hackathon.firstPrize || "TBA"}</p>
                      {hackathon.points1st > 0 && <div className="text-xs font-bold text-yellow-700 mt-1">+{hackathon.points1st} Leaderboard pts</div>}
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">🥈</div>
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300">Second Prize</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{hackathon.secondPrize || "TBA"}</p>
                      {hackathon.points2nd > 0 && <div className="text-xs font-bold text-gray-700 mt-1">+{hackathon.points2nd} Leaderboard pts</div>}
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">🥉</div>
                      <h4 className="font-semibold text-orange-700 dark:text-orange-300">Third Prize</h4>
                      <p className="text-sm text-orange-600 dark:text-orange-400">{hackathon.thirdPrize || "TBA"}</p>
                      {hackathon.points3rd > 0 && <div className="text-xs font-bold text-orange-700 mt-1">+{hackathon.points3rd} Leaderboard pts</div>}
                    </div>
                  </div>

                  {hackathon.pointsParticipation > 0 && (
                    <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded border border-gray-100 dark:border-gray-800 text-center font-medium">
                      * All other active participants will receive <span className="font-bold text-primary">+{hackathon.pointsParticipation} points</span> on the technical council leaderboard.
                    </div>
                  )}
                </CardContent>
              </Card>

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
                      {hackathon.status === 'ongoing' && (
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
                    // Registration Form
                    <form onSubmit={handleRegister} className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="studName" className="text-neutral-900 dark:text-neutral-200 mb-1.5 block">Full Name</Label>
                          <Input
                            id="studName"
                            value={session?.user?.name || ""}
                            disabled
                            className="bg-gray-100/50 dark:bg-gray-900/50 cursor-not-allowed font-medium text-neutral-900 dark:text-neutral-100"
                          />
                        </div>
                        <div>
                          <Label htmlFor="studEmail" className="text-neutral-900 dark:text-neutral-200 mb-1.5 block">Email Address</Label>
                          <Input
                            id="studEmail"
                            value={session?.user?.email || ""}
                            disabled
                            className="bg-gray-100/50 dark:bg-gray-900/50 cursor-not-allowed font-medium text-neutral-900 dark:text-neutral-100"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <Label htmlFor="degree" className="text-neutral-900 dark:text-neutral-200 mb-1.5 block">Degree Type *</Label>
                          <select
                            id="degree"
                            value={degreeType}
                            onChange={(e) => setDegreeType(e.target.value)}
                            className="w-full flex h-10 rounded-md border border-input text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="btech" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">B.Tech</option>
                            <option value="mtech" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">M.Tech</option>
                            <option value="phd" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">PhD</option>
                            <option value="other" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">Other</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="joiningYear" className="text-neutral-900 dark:text-neutral-200 mb-1.5 block">Year of Joining *</Label>
                          <select
                            id="joiningYear"
                            value={yearOfJoining}
                            onChange={(e) => setYearOfJoining(e.target.value)}
                            className="w-full flex h-10 rounded-md border border-input text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="2022" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">2022</option>
                            <option value="2023" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">2023</option>
                            <option value="2024" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">2024</option>
                            <option value="2025" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">2025</option>
                            <option value="2026" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">2026</option>
                            <option value="other" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">Other</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="branch" className="text-neutral-900 dark:text-neutral-200 mb-1.5 block">Branch Name *</Label>
                          <Input
                            id="branch"
                            placeholder="e.g., Computer Science"
                            value={branchName}
                            onChange={(e) => setBranchName(e.target.value)}
                            className="border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-gray-500"
                            required
                          />
                        </div>
                      </div>

                      {/* Team Members */}
                      {hackathon.teamRequired && (
                        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/65 space-y-4">
                          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                            <Label className="text-base font-semibold">Team Members List</Label>
                            <span className="text-xs text-muted-foreground font-medium">Add all team participants</span>
                          </div>

                          {teamMembers.length > 0 && (
                            <div className="space-y-2">
                              {teamMembers.map((member, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-sm">
                                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                                    {idx + 1}. {member}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeTeamMember(idx)}
                                    className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter team member name/email"
                              value={newTeamMember}
                              onChange={(e) => setNewTeamMember(e.target.value)}
                              className="border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-gray-500"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addTeamMember();
                                }
                              }}
                            />
                            <Button type="button" onClick={addTeamMember} variant="outline" className="flex-shrink-0">
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={submittingReg}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-xl shadow-md border-0"
                      >
                        {submittingReg ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            <span>Registering...</span>
                          </div>
                        ) : (
                          <span>Confirm Registration</span>
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
                    <p className="font-medium">{hackathon.date}</p>
                    {(hackathon.startTime || hackathon.endTime) && (
                      <p className="text-sm text-muted-foreground">
                        {hackathon.startTime && hackathon.endTime 
                          ? `${hackathon.startTime} - ${hackathon.endTime}`
                          : hackathon.startTime || hackathon.endTime}
                      </p>
                    )}
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
