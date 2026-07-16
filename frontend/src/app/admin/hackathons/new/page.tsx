"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { hackathonCategories, hackathonStatuses, type WinnerTier } from "@/lib/hackathons-data";
import { api } from "../../../../../services/api";

export default function NewHackathonPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    longDescription: "",
    startDate: "",
    endDate: "",
    location: "",
    category: "",
    status: "upcoming" as const,
    registrationLink: "",
    
    // Organizer details
    organizerName: "",
    organizerEmail: "",
    organizerPhone: "",
    organizerWebsite: "",
    
    // Requirements and eligibility
    requirements: "",
    eligibility: "",
    teamSize: "",
    
    // Prize pool
    specialPrizes: "",
    
    // Timeline and important details
    timeline: "",
    importantNotes: "",
    
    // Additional details
    themes: "",
    judingCriteria: "",
    submissionGuidelines: "",

    // draft config
    draft: false,
  });

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        alert("Hackathon name is required");
        return;
      }
      if (!formData.startDate) {
        alert("Registration Date is required");
        return;
      }
      if (!formData.endDate) {
        alert("Submission Date is required");
        return;
      }
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        alert("Submission Date cannot be before Registration Date");
        return;
      }
      if (!formData.description.trim()) {
        alert("Hackathon description is required");
        return;
      }
      if (!formData.longDescription.trim()) {
        alert("Long description is required");
        return;
      }
      const hackathonData = {
        ...formData
      };
      const response = await  api.fetch("/api/admin/hackathons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hackathonData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create hackathon");
      }
      alert("Hackathon created successfully!");
      router.push("/admin/hackathons");
    } catch (error) {
      console.error("Error creating hackathon:", error);
      alert(error instanceof Error ? error.message : "Failed to create hackathon. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/hackathons">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Hackathons
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk">
              Create New Hackathon
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add a new hackathon or competition event
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential details about the hackathon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Hackathon Name *</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={e => handleInputChange("name", e.target.value)} 
                    required 
                    placeholder="e.g. Winter Hackathon 2025" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Registration Date *</Label>
                  <Input 
                    id="startDate" 
                    type="date"
                    value={formData.startDate} 
                    onChange={e => handleInputChange("startDate", e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Submission Date *</Label>
                  <Input 
                    id="endDate" 
                    type="date"
                    value={formData.endDate} 
                    onChange={e => handleInputChange("endDate", e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Short Description *</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={e => handleInputChange("description", e.target.value)} 
                  required 
                  placeholder="A brief summary of the hackathon (for cards)" 
                />
              </div>

              <div>
                <Label htmlFor="longDescription">Detailed Description *</Label>
                <Textarea 
                  id="longDescription" 
                  value={formData.longDescription} 
                  onChange={e => handleInputChange("longDescription", e.target.value)} 
                  required 
                  placeholder="Full details about the hackathon (for the main page)" 
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={value => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {hackathonCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={value => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {hackathonStatuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={formData.location} 
                    onChange={e => handleInputChange("location", e.target.value)} 
                    placeholder="e.g., Online or SAC, IIT Bombay" 
                  />
                </div>
                <div>
                  <Label htmlFor="registrationLink">Event Info Link (PDF URL)</Label>
                  <Input 
                    id="registrationLink" 
                    value={formData.registrationLink} 
                    onChange={e => handleInputChange("registrationLink", e.target.value)} 
                    placeholder="e.g. https://domain.com/event-rules.pdf" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Organizer Details</CardTitle>
              <CardDescription>Contact information for the hackathon organizers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organizerName">Organizer Name</Label>
                  <Input 
                    id="organizerName" 
                    value={formData.organizerName} 
                    onChange={e => handleInputChange("organizerName", e.target.value)} 
                    placeholder="e.g., Tech Team IIT Gandhinagar" 
                  />
                </div>
                <div>
                  <Label htmlFor="organizerEmail">Organizer Email</Label>
                  <Input 
                    id="organizerEmail" 
                    value={formData.organizerEmail} 
                    onChange={e => handleInputChange("organizerEmail", e.target.value)} 
                    placeholder="e.g., tech@iitgn.ac.in" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organizerPhone">Organizer Phone</Label>
                  <Input 
                    id="organizerPhone" 
                    value={formData.organizerPhone} 
                    onChange={e => handleInputChange("organizerPhone", e.target.value)} 
                    placeholder="e.g., +91 12345 67890" 
                  />
                </div>
                <div>
                  <Label htmlFor="organizerWebsite">Organizer Website</Label>
                  <Input 
                    id="organizerWebsite" 
                    value={formData.organizerWebsite} 
                    onChange={e => handleInputChange("organizerWebsite", e.target.value)} 
                    placeholder="e.g., https://tech.iitgn.ac.in" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements & Eligibility */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements & Eligibility</CardTitle>
              <CardDescription>Participation requirements and team information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="eligibility">Eligibility Criteria</Label>
                <Textarea 
                  id="eligibility" 
                  value={formData.eligibility} 
                  onChange={e => handleInputChange("eligibility", e.target.value)} 
                  placeholder="Who can participate? Any age restrictions, student requirements, etc." 
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="requirements">Technical Requirements</Label>
                <Textarea 
                  id="requirements" 
                  value={formData.requirements} 
                  onChange={e => handleInputChange("requirements", e.target.value)} 
                  placeholder="What participants need to bring or have (laptop, software, etc.)" 
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="teamSize">Team Size</Label>
                <Input 
                  id="teamSize" 
                  value={formData.teamSize} 
                  onChange={e => handleInputChange("teamSize", e.target.value)} 
                  placeholder="e.g., 2-4 members per team" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Prize Details */}
          <Card>
            <CardHeader>
              <CardTitle>Prize Details</CardTitle>
              <CardDescription>Specify any general tracks or sponsors' special awards</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="specialPrizes">Special Prizes / Track Details</Label>
                <Textarea 
                  id="specialPrizes" 
                  value={formData.specialPrizes} 
                  onChange={e => handleInputChange("specialPrizes", e.target.value)} 
                  placeholder="General details about sponsors' special tracks, API prizes, etc." 
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Timeline & Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline & Additional Information</CardTitle>
              <CardDescription>Schedule and important details for participants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Textarea 
                  id="timeline" 
                  value={formData.timeline} 
                  onChange={e => handleInputChange("timeline", e.target.value)} 
                  placeholder="Day 1: Registration & Opening - 9:00 AM&#10;Day 1: Hacking Begins - 10:00 AM&#10;Day 2: Final Presentations - 4:00 PM&#10;Day 2: Results & Closing - 6:00 PM" 
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="themes">Themes/Tracks</Label>
                <Textarea 
                  id="themes" 
                  value={formData.themes} 
                  onChange={e => handleInputChange("themes", e.target.value)} 
                  placeholder="Education Technology, Healthcare Innovation, Smart Cities, etc." 
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="judingCriteria">Judging Criteria</Label>
                <Textarea 
                  id="judingCriteria" 
                  value={formData.judingCriteria} 
                  onChange={e => handleInputChange("judingCriteria", e.target.value)} 
                  placeholder="Innovation (30%), Technical Implementation (25%), Impact (25%), Presentation (20%)" 
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="submissionGuidelines">Submission Guidelines</Label>
                <Textarea 
                  id="submissionGuidelines" 
                  value={formData.submissionGuidelines} 
                  onChange={e => handleInputChange("submissionGuidelines", e.target.value)} 
                  placeholder="What to submit: GitHub repo, demo video, presentation slides, etc." 
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="importantNotes">Important Notes</Label>
                <Textarea 
                  id="importantNotes" 
                  value={formData.importantNotes} 
                  onChange={e => handleInputChange("importantNotes", e.target.value)} 
                  placeholder="Any special instructions, rules, or important information for participants" 
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Publication Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publication Settings</CardTitle>
              <CardDescription>Configure hackathon draft status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="draft" className="text-base font-semibold">Save as Draft</Label>
                  <p className="text-xs text-muted-foreground">Keep this hackathon private until ready to publish</p>
                </div>
                <Switch 
                  id="draft" 
                  checked={formData.draft} 
                  onCheckedChange={checked => handleInputChange("draft", checked)} 
                />
              </div>
            </CardContent>
          </Card>
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating..." : "Create Hackathon"}
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
}
