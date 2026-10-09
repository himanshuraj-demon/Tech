"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Loader2, Trophy, ArrowLeft, Save, Users, AlertCircle, Calendar, UserCheck, ExternalLink, Github, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  submissionData?: Record<string, string> | null;
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
  
  // Winners selection state: dynamic rows
  interface WinnerRow {
    label: string;
    regId: string;
    points: string;
  }
  const [winnerRows, setWinnerRows] = useState<WinnerRow[]>([
    { label: "1st Place", regId: "", points: "100" }
  ]);
  const [participationPoints, setParticipationPoints] = useState<string>("0");

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

      // Populate winnerRows from DB configuration if exists
      if (hackathonData.winnerTiers && hackathonData.winnerTiers.length > 0) {
        const rows: WinnerRow[] = hackathonData.winnerTiers.map((tier: any) => {
          const matchingReg = regData.find((r: Registration) => r.winnerPlace === tier.rank);
          return {
            label: tier.name,
            regId: matchingReg ? matchingReg.id : "",
            points: String(tier.points)
          };
        });
        setWinnerRows(rows);
      } else {
        setWinnerRows([{ label: "1st Place", regId: "", points: "100" }]);
      }
      setParticipationPoints(String(hackathonData.pointsParticipation !== undefined ? hackathonData.pointsParticipation : "0"));

    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load hackathon participants");
      router.push("/admin/hackathons");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRow = () => {
    setWinnerRows(prev => {
      const nextNum = prev.length + 1;
      let defaultLabel = `${nextNum}th Place`;
      if (nextNum === 1) defaultLabel = "1st Place";
      else if (nextNum === 2) defaultLabel = "2nd Place";
      else if (nextNum === 3) defaultLabel = "3rd Place";
      return [
        ...prev,
        { label: defaultLabel, regId: "", points: "50" }
      ];
    });
  };

  const handleRemoveRow = (index: number) => {
    setWinnerRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, field: keyof WinnerRow, value: string) => {
    setWinnerRows(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSaveWinners = async () => {
    // Validate rows
    for (let i = 0; i < winnerRows.length; i++) {
      const row = winnerRows[i];
      if (!row.regId) {
        alert(`Please select a winner for row ${i + 1}`);
        return;
      }
      if (!row.label.trim()) {
        alert(`Please enter a label for row ${i + 1}`);
        return;
      }
      if (row.points === "" || isNaN(Number(row.points)) || Number(row.points) < 0) {
        alert(`Please enter valid points (>= 0) for row ${i + 1}`);
        return;
      }
    }

    const selectedIds = winnerRows.map(r => r.regId).filter(id => id !== "");
    const hasDuplicates = new Set(selectedIds).size !== selectedIds.length;
    if (hasDuplicates) {
      alert("A participant cannot win multiple placements!");
      return;
    }
 
    try {
      setIsSaving(true);
      
      const placements = winnerRows.map((row, index) => ({
        regId: row.regId,
        rank: index + 1
      }));

      const winnerTiers = winnerRows.map((row, index) => ({
        rank: index + 1,
        name: row.label,
        points: Number(row.points),
        prize: "TBD"
      }));
 
      const response = await api.fetch(`/api/admin/hackathons/${hackathonId}/winners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          placements, 
          winnerTiers, 
          pointsParticipation: Number(participationPoints || "0") 
        }),
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
    const customFields: Array<{ id: string; title: string }> = 
      (hackathon?.submissionFields && hackathon.submissionFields.length > 0)
        ? hackathon.submissionFields
        : [{ id: "field_default", title: "Project Submission Details" }];

    // 1. Define clean, focused CSV headers based on student info & custom inputs
    const headers = [
      "Student Name",
      "Student Email",
      "Winner Status",
      ...customFields.map(f => f.title),
      "Registration Date"
    ];

    // 2. Map registrations to CSV rows
    const rows = registrations.map(reg => {
      let winnerStatus = "Participant";
      if (reg.winnerPlace === 1) winnerStatus = "1st Place (Gold)";
      else if (reg.winnerPlace === 2) winnerStatus = "2nd Place (Silver)";
      else if (reg.winnerPlace === 3) winnerStatus = "3rd Place (Bronze)";
      else if (reg.winnerPlace) {
        const tier = hackathon?.winnerTiers?.find((t: any) => t.rank === reg.winnerPlace);
        winnerStatus = tier ? tier.name : `${reg.winnerPlace}th Place`;
      }

      let data: Record<string, any> = {};
      if (typeof reg.submissionData === "string") {
        try {
          data = JSON.parse(reg.submissionData);
        } catch {}
      } else if (reg.submissionData && typeof reg.submissionData === "object") {
        data = reg.submissionData;
      }

      const submissionCells = customFields.map(field => {
        let val = data[field.id] !== undefined ? data[field.id] : data[field.title];
        if (!val) {
          const matchedKey = Object.keys(data).find(
            k => k.toLowerCase() === field.title.toLowerCase() || k.toLowerCase() === field.id.toLowerCase()
          );
          if (matchedKey) val = data[matchedKey];
        }

        if (val) return String(val);

        const lower = field.title.toLowerCase();
        if ((lower.includes("github") || lower.includes("repo")) && reg.githubLink) return reg.githubLink;
        if ((lower.includes("doc") || lower.includes("link") || lower.includes("drive")) && reg.docsLink) return reg.docsLink;

        if (customFields.length === 1) {
          if (reg.githubLink && reg.docsLink) return `${reg.githubLink} | ${reg.docsLink}`;
          if (reg.githubLink) return reg.githubLink;
          if (reg.docsLink) return reg.docsLink;
        }

        return "Not Submitted";
      });

      return [
        reg.userName,
        reg.userEmail,
        winnerStatus,
        ...submissionCells,
        new Date(reg.createdAt).toLocaleDateString()
      ];
    });

    // 3. Helper to escape fields containing quotes, newlines, or commas
    const escapeCSV = (field: any) => {
      const cleanField = (field ?? "").toString().replace(/"/g, '""');
      if (cleanField.includes(",") || cleanField.includes("\n") || cleanField.includes("\r") || cleanField.includes('"')) {
        return `"${cleanField}"`;
      }
      return cleanField;
    };

    // 4. Construct CSV string with UTF-8 BOM so Excel opens with proper encoding
    const csvContent = "\uFEFF" + [
      headers.map(escapeCSV).join(","),
      ...rows.map(row => row.map(escapeCSV).join(","))
    ].join("\r\n");

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

  const handleImportFromCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      
      // Robust CSV parser supporting quotes, commas, escaped quotes, and multiline values
      const parseCSV = (csvText: string): string[][] => {
        let cleanText = csvText;
        if (cleanText.charCodeAt(0) === 0xFEFF) {
          cleanText = cleanText.slice(1);
        }

        const rows: string[][] = [];
        let currentRow: string[] = [];
        let currentCell = "";
        let insideQuotes = false;

        for (let i = 0; i < cleanText.length; i++) {
          const char = cleanText[i];
          const nextChar = cleanText[i + 1];

          if (char === '"') {
            if (insideQuotes && nextChar === '"') {
              currentCell += '"';
              i++;
            } else {
              insideQuotes = !insideQuotes;
            }
          } else if (char === "," && !insideQuotes) {
            currentRow.push(currentCell.trim());
            currentCell = "";
          } else if ((char === "\r" || char === "\n") && !insideQuotes) {
            if (char === "\r" && nextChar === "\n") {
              i++;
            }
            currentRow.push(currentCell.trim());
            if (currentRow.some(c => c.length > 0)) {
              rows.push(currentRow);
            }
            currentRow = [];
            currentCell = "";
          } else {
            currentCell += char;
          }
        }

        currentRow.push(currentCell.trim());
        if (currentRow.some(c => c.length > 0)) {
          rows.push(currentRow);
        }

        return rows;
      };

      const parsedRows = parseCSV(text);
      if (parsedRows.length < 2) {
        alert("The uploaded CSV appears to be empty or has no data rows.");
        return;
      }

      const headers = parsedRows[0].map(h => h.trim());
      const emailIdx = headers.findIndex(h => h.toLowerCase().includes("email"));
      if (emailIdx === -1) {
        alert("Could not find a 'Student Email' column in the CSV.");
        return;
      }

      const winnerIdx = headers.findIndex(h => {
        const lower = h.toLowerCase();
        return lower.includes("winner") || lower.includes("rank") || lower.includes("place");
      });

      const customFields: Array<{ id: string; title: string }> = 
        (hackathon?.submissionFields && hackathon.submissionFields.length > 0)
          ? hackathon.submissionFields
          : [{ id: "field_default", title: "Project Submission Details" }];

      const itemsToImport: Array<{
        email: string;
        submissionData: Record<string, string>;
        githubLink?: string;
        docsLink?: string;
        winnerPlace?: number | null;
      }> = [];

      for (let i = 1; i < parsedRows.length; i++) {
        const row = parsedRows[i];
        const email = row[emailIdx]?.trim();
        if (!email) continue;

        const subData: Record<string, string> = {};
        let ghLink: string | undefined;
        let dLink: string | undefined;
        let winnerPlace: number | null | undefined = undefined;

        if (winnerIdx !== -1 && row[winnerIdx] !== undefined) {
          const wVal = row[winnerIdx].toLowerCase().trim();
          if (wVal.includes("1") || wVal.includes("first") || wVal.includes("gold")) {
            winnerPlace = 1;
          } else if (wVal.includes("2") || wVal.includes("second") || wVal.includes("silver")) {
            winnerPlace = 2;
          } else if (wVal.includes("3") || wVal.includes("third") || wVal.includes("bronze")) {
            winnerPlace = 3;
          } else if (wVal === "participant" || wVal === "none" || wVal === "0" || wVal === "" || wVal === "-") {
            winnerPlace = null;
          } else {
            const num = parseInt(wVal.replace(/\D/g, ""), 10);
            winnerPlace = !isNaN(num) && num > 0 ? num : null;
          }
        }

        headers.forEach((header, colIdx) => {
          if (colIdx === emailIdx || colIdx === winnerIdx) return;
          const cellVal = row[colIdx];
          if (!cellVal || cellVal === "Not Submitted") return;

          const cleanHeader = header.toLowerCase().trim();
          if (
            cleanHeader.includes("student name") || 
            cleanHeader.includes("registration date") || 
            cleanHeader.includes("registered at") ||
            cleanHeader.includes("degree type") ||
            cleanHeader.includes("branch name") ||
            cleanHeader.includes("year of joining") ||
            cleanHeader.includes("team members")
          ) {
            return;
          }

          const matchedField = customFields.find(
            f => f.title.toLowerCase().trim() === cleanHeader || f.id.toLowerCase().trim() === cleanHeader
          );

          if (matchedField) {
            subData[matchedField.id] = cellVal;
          } else if (customFields.length === 1 && !cleanHeader.includes("email") && !cleanHeader.includes("name")) {
            subData[customFields[0].id] = cellVal;
          }

          if (cellVal.includes("github.com") || cleanHeader.includes("github") || cleanHeader.includes("repo")) {
            ghLink = cellVal;
          }
          if (cellVal.includes("drive.google.com") || cellVal.includes("notion.so") || cleanHeader.includes("doc") || cleanHeader.includes("drive")) {
            dLink = cellVal;
          }
        });

        itemsToImport.push({
          email,
          submissionData: subData,
          githubLink: ghLink,
          docsLink: dLink,
          winnerPlace,
        });
      }

      if (itemsToImport.length === 0) {
        alert("No valid participant rows found in the CSV.");
        return;
      }

      setIsSaving(true);
      const res = await api.fetch(`/api/admin/hackathons/${hackathonId}/import-submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsToImport }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to import CSV");
      }

      const resData = await res.json();
      alert(resData.message || "Excel/CSV imported successfully! 🎉");
      fetchHackathonAndParticipants();
    } catch (err) {
      console.error("Error importing CSV:", err);
      alert(err instanceof Error ? err.message : "Failed to parse or import CSV file.");
    } finally {
      setIsSaving(false);
      e.target.value = "";
    }
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
          <div className="flex items-center gap-2 flex-wrap">
            {registrations.length > 0 && (
              <Button 
                onClick={handleExportToCSV} 
                variant="outline" 
                className="flex items-center gap-2 border-emerald-600/30 hover:bg-emerald-600/10 hover:border-emerald-600/50 transition-all duration-300 text-emerald-600 dark:text-emerald-400 text-xs font-semibold"
              >
                <Download className="h-4 w-4" />
                Export to Excel (CSV)
              </Button>
            )}
            <label className="inline-flex items-center gap-2 px-3 py-2 border border-blue-600/30 hover:bg-blue-600/10 hover:border-blue-600/50 rounded-md text-xs font-semibold text-blue-600 dark:text-blue-400 cursor-pointer transition-all duration-300">
              <Upload className="h-4 w-4" />
              Import Excel (CSV)
              <input
                type="file"
                accept=".csv"
                onChange={handleImportFromCSV}
                className="hidden"
                disabled={isSaving}
              />
            </label>
          </div>
        </div>
        {/* Winner Selection Box (At Top) */}
        <Card className="glass border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary font-space-grotesk">
              <Trophy className="h-5 w-5" />
              Assign Winners & Distribute Points
            </CardTitle>
            <CardDescription>Configure winner labels, select participants, and specify leaderboard points. Submitting will end the event.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {registrations.length === 0 ? (
              <div className="text-sm text-muted-foreground flex items-center gap-1.5 py-4 justify-center">
                <AlertCircle className="h-4 w-4" />
                No registered participants to choose from.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  {winnerRows.map((row, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-3 items-end bg-white/50 dark:bg-neutral-900/50 p-4 rounded-xl border border-gray-150/40 dark:border-gray-800 shadow-xs w-full">
                      <div className="flex-1 space-y-1.5 w-full">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Winner Label</label>
                        <Input 
                          placeholder="e.g. 1st Place" 
                          value={row.label} 
                          onChange={e => handleUpdateRow(index, "label", e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="flex-[1.5] space-y-1.5 w-full">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Choose Winner</label>
                        <select
                          value={row.regId}
                          onChange={e => handleUpdateRow(index, "regId", e.target.value)}
                          className="w-full flex h-10 rounded-md border border-input text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                          required
                        >
                          <option value="" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">Select Participant</option>
                          {registrations.map(r => (
                            <option key={r.id} value={r.id} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                              {r.userName} ({r.userEmail})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full md:w-32 space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Points</label>
                        <Input 
                          type="number"
                          placeholder="Points" 
                          value={row.points} 
                          onChange={e => handleUpdateRow(index, "points", e.target.value)} 
                          required 
                          min={0}
                        />
                      </div>
                      {winnerRows.length > 1 && (
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          className="h-10 w-10 shrink-0" 
                          onClick={() => handleRemoveRow(index)}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAddRow}
                  >
                    + Add Winner Row
                  </Button>

                  <div className="flex items-center gap-3 bg-white/30 dark:bg-neutral-900/30 p-2 px-3 rounded-lg border border-gray-150/40 dark:border-gray-800">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Participation Points (Optional):</label>
                    <Input 
                      type="number" 
                      className="w-20 h-9" 
                      value={participationPoints} 
                      onChange={e => setParticipationPoints(e.target.value)} 
                      min={0}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                  <Button
                    onClick={handleSaveWinners}
                    disabled={isSaving}
                    size="lg"
                    className="w-full md:w-auto"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving Winners & Allocating Points...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Winners & Distribute Points
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Participant List Table */}
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
                        <td className="px-4 py-3.5 max-w-sm">
                          {hackathon?.submissionFields && hackathon.submissionFields.length > 0 ? (
                            <div className="flex flex-col gap-1.5">
                              {hackathon.submissionFields.map((field: any) => {
                                let data: Record<string, any> = {};
                                if (typeof reg.submissionData === "string") {
                                  try { data = JSON.parse(reg.submissionData); } catch {}
                                } else if (reg.submissionData && typeof reg.submissionData === "object") {
                                  data = reg.submissionData;
                                }
                                const val = data[field.id] !== undefined ? data[field.id] : data[field.title];
                                const fallbackVal = !val ? (
                                  (field.title.toLowerCase().includes("github") || field.title.toLowerCase().includes("repo")) ? reg.githubLink :
                                  (field.title.toLowerCase().includes("doc") || field.title.toLowerCase().includes("link") || field.title.toLowerCase().includes("drive")) ? reg.docsLink :
                                  (hackathon.submissionFields.length === 1 ? (reg.githubLink || reg.docsLink) : null)
                                ) : null;
                                const displayVal = val || fallbackVal;

                                if (!displayVal) {
                                  return (
                                    <div key={field.id} className="text-xs text-muted-foreground flex items-center gap-1">
                                      <span className="font-semibold text-gray-500">{field.title}:</span>
                                      <span className="italic text-gray-400">Not submitted</span>
                                    </div>
                                  );
                                }

                                const isUrl = typeof displayVal === "string" && (
                                  displayVal.startsWith("http://") || 
                                  displayVal.startsWith("https://") || 
                                  displayVal.startsWith("www.") || 
                                  displayVal.includes("github.com") || 
                                  displayVal.includes("drive.google.com")
                                );

                                return (
                                  <div key={field.id} className="text-xs">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">{field.title}: </span>
                                    {isUrl ? (
                                      <a
                                        href={displayVal.startsWith("http") ? displayVal : `https://${displayVal}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline inline-flex items-center gap-1 font-medium break-all"
                                      >
                                        <ExternalLink className="h-3 w-3 inline shrink-0" />
                                        Link
                                      </a>
                                    ) : (
                                      <span className="text-muted-foreground line-clamp-2" title={displayVal}>
                                        {displayVal}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {reg.githubLink ? (
                                <a 
                                  href={reg.githubLink.startsWith('http') ? reg.githubLink : `https://${reg.githubLink}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                                >
                                  <Github className="h-3.5 w-3.5 shrink-0" />
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
                                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                  Docs Link
                                </a>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">No Docs link</span>
                              )}
                            </div>
                          )}
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
    </AdminLayout>
  );
}
