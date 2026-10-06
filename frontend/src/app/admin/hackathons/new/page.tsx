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
import { MarkdownEditor } from "@/components/ui/markdown-editor";

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

              <MarkdownEditor
                id="longDescription"
                label="Detailed Description"
                description="Full details about the hackathon with headings, lists, bold, and formatting"
                value={formData.longDescription}
                onChange={val => handleInputChange("longDescription", val)}
                required
                placeholder="## About the Challenge&#10;&#10;Describe the hackathon objectives, tracks, and instructions...&#10;&#10;### Key Details:&#10;- Registration instructions&#10;- Evaluation process"
                rows={8}
              />

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
            <CardContent className="space-y-6">
              <MarkdownEditor
                id="eligibility"
                label="Eligibility Criteria"
                description="Who can participate? Grade, branches, or team rules (Markdown supported)"
                value={formData.eligibility}
                onChange={val => handleInputChange("eligibility", val)}
                placeholder="- Open to all undergraduate & postgraduate students&#10;- Inter-college teams allowed"
                rows={3}
              />

              <MarkdownEditor
                id="requirements"
                label="Technical Requirements"
                description="What participants need to bring or have (Markdown supported)"
                value={formData.requirements}
                onChange={val => handleInputChange("requirements", val)}
                placeholder="- Laptop with Wi-Fi capability&#10;- GitHub account&#10;- Relevant software installed"
                rows={3}
              />

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
              <MarkdownEditor
                id="specialPrizes"
                label="Special Prizes / Track Details"
                description="Details about sponsor bounties, track awards, or perks (Markdown supported)"
                value={formData.specialPrizes}
                onChange={val => handleInputChange("specialPrizes", val)}
                placeholder="### Sponsor Track Prizes&#10;- **Best AI Project**: ₹25,000&#10;- **Best Web3 App**: ₹20,000"
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Timeline & Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline & Additional Information</CardTitle>
              <CardDescription>Schedule and important details for participants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <MarkdownEditor
                id="timeline"
                label="Timeline"
                description="Event schedule and milestones (Markdown supported)"
                value={formData.timeline}
                onChange={val => handleInputChange("timeline", val)}
                placeholder="### Day 1: October 15&#10;- **09:00 AM**: Check-in & Breakfast&#10;- **10:00 AM**: Opening Ceremony & Hacking Begins&#10;&#10;### Day 2: October 16&#10;- **04:00 PM**: Project Submissions Close&#10;- **06:00 PM**: Award Ceremony"
                rows={6}
              />

              <MarkdownEditor
                id="themes"
                label="Themes / Tracks"
                description="Themes, problem statements, and focus areas (Markdown supported)"
                value={formData.themes}
                onChange={val => handleInputChange("themes", val)}
                placeholder="- **FinTech & DeFi**&#10;- **Healthcare & BioTech**&#10;- **Smart Cities & Sustainability**"
                rows={3}
              />

              <MarkdownEditor
                id="judingCriteria"
                label="Judging Criteria"
                description="Rubric and scoring weights (Markdown supported)"
                value={formData.judingCriteria}
                onChange={val => handleInputChange("judingCriteria", val)}
                placeholder="- **Innovation & Originality** (30%)&#10;- **Technical Execution** (25%)&#10;- **Design & UX** (25%)&#10;- **Presentation & Pitch** (20%)"
                rows={3}
              />

              <MarkdownEditor
                id="submissionGuidelines"
                label="Submission Guidelines"
                description="What participants must submit (Markdown supported)"
                value={formData.submissionGuidelines}
                onChange={val => handleInputChange("submissionGuidelines", val)}
                placeholder="### Deliverables:&#10;1. Public GitHub repository link&#10;2. 2-minute demo video (YouTube/Loom)&#10;3. Slide deck or README documentation"
                rows={4}
              />

              <MarkdownEditor
                id="importantNotes"
                label="Important Notes"
                description="Special rules, code of conduct, or warnings (Markdown supported)"
                value={formData.importantNotes}
                onChange={val => handleInputChange("importantNotes", val)}
                placeholder="> **Note:** All code must be written during the hackathon period. Pre-existing code must be disclosed."
                rows={4}
              />
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
