"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Mail,
  Users,
  Award,
  AlertCircle,
  RefreshCw,
  Phone,
  Calendar,
  Rocket,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClubDetail } from "@/lib/queries";

interface Club {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  type: "club" | "hobby-group";
  category: string;
  members: string;
  established: string;
  email: string;
  achievements: string[];
  projects: string[];
  team: Array<{
    name: string;
    role: string;
    email: string;
    phone?: string;
  }>;
  logoPath?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper function to get logo path
const getLogoPath = (club: Club) => {
  if (club.logoPath) {
    return club.logoPath;
  }

  // Fallback to static logo mapping for existing clubs
  const logoMap: Record<string, string> = {
    // Technical Clubs
    metis: "/logos/clubs/metis.jpeg",
    digis: "/logos/clubs/digis.jpg",
    "mean-mechanics": "/logos/clubs/mean-mechanics.png",
    odyssey: "/logos/clubs/odyssey.jpg",
    grasp: "/logos/clubs/grasp.png",
    "machine-learning": "/logos/clubs/machine-learning.jpeg",
    "tinkerers-lab": "/logos/clubs/tinkerers-lab.png",
    anveshanam: "/logos/clubs/anveshanam.png",

    // Hobby Groups
    embed: "/logos/hobby-groups/embed.png",
    "blockchain-hobby": "/logos/hobby-groups/blockchain-hobby.png",
  };

  return logoMap[club.id] || null;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/* ---------- Loading skeleton ---------- */
function PageSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="container px-4 md:px-6 py-4">
        <div className="h-8 w-44 rounded-md bg-muted" />
      </div>
      <section className="py-16 lg:py-24">
        <div className="container px-4 md:px-6 grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-5">
            <div className="h-7 w-28 rounded-full bg-muted" />
            <div className="h-12 w-3/4 rounded-lg bg-muted" />
            <div className="h-5 w-full rounded bg-muted" />
            <div className="h-5 w-2/3 rounded bg-muted" />
            <div className="flex gap-3 pt-2">
              <div className="h-10 w-32 rounded-lg bg-muted" />
              <div className="h-10 w-32 rounded-lg bg-muted" />
            </div>
          </div>
          <div className="aspect-square max-w-md w-full mx-auto rounded-3xl bg-muted" />
        </div>
      </section>
    </div>
  );
}

/* ---------- Section heading ---------- */
function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8 flex items-center gap-3">
      {icon && (
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/15 to-purple-600/15 ring-1 ring-blue-600/20">
          {icon}
        </div>
      )}
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-space-grotesk sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default function ClubDetailPage() {
  const params = useParams();
  const clubId = params.id as string;

  const { data: club, isLoading, error, refetch } = useClubDetail(clubId);

  // Handle 404
  if (!isLoading && error?.message === "NOT_FOUND") {
    notFound();
  }

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error && error.message !== "NOT_FOUND") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="glass rounded-2xl p-8 text-center max-w-md w-full border border-red-500/20">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">
            Failed to load club details. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!club) {
    notFound();
  }

  const logo = getLogoPath(club);
  const hasAchievements = club.achievements && club.achievements.length > 0;
  const hasProjects = club.projects && club.projects.length > 0;

  return (
    <div className="flex flex-col overflow-x-hidden mt-16">
      {/* Back Navigation */}
      <div className="container px-4 md:px-6 py-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="group -ml-2 text-muted-foreground hover:text-foreground transition-colors">
          <Link href="/clubs">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span className="text-sm">Back to Clubs & Groups</span>
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative py-12 lg:py-24">
        <div className="absolute inset-0 gradient-bg opacity-10" />
        {/* soft glows */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />

        <div className="container relative z-10 px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <div className="space-y-5">
                <span className="inline-flex items-center gap-1.5 rounded-xl  px-3.5 py-1 text-sm font-medium text-blue-600 dark:text-blue-300">
                  {club.category}
                </span>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl font-space-grotesk leading-[1.05]">
                  {club.name}
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
                  {club.description}
                </p>
              </div>

              {/* Stat chips */}
              <div className="flex flex-wrap gap-3">
                <div className="glass flex items-center gap-3 rounded-xl border border-border/60 px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-base font-semibold">{club.members}</p>
                    <p className="text-xs text-muted-foreground">Members</p>
                  </div>
                </div>
                {club.established && (
                  <div className="glass flex items-center gap-3 rounded-xl border border-border/60 px-4 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600/10">
                      <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="leading-tight">
                      <p className="text-base font-semibold">
                        {club.established}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Established
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {club.email && (
                <div className="flex flex-wrap gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r  from-blue-600 to-purple-600 dark:text-white shadow-lg shadow-blue-600/20 hover:opacity-90 transition-opacity">
                    <a href={`mailto:${club.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Us
                    </a>
                  </Button>
                </div>
              )}
            </div>

            {/* Logo card */}
            <div className="order-1 lg:order-2 relative mx-auto w-full max-w-md">
              <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-1 shadow-xl">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.4rem]  bg-background/60 backdrop-blur-sm">
                  {logo ? (
                    <Image
                      src={logo}
                      alt={`${club.name} logo`}
                      width={300}
                      height={300}
                      priority
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-7xl font-bold font-space-grotesk bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent opacity-80">
                      {getInitials(club.name)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 lg:py-20 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tighter font-space-grotesk mb-2">
              About Us
            </h2>
            <div className="h-1 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-6" />
            <p className="text-muted-foreground text-lg leading-relaxed">
              {club.longDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Achievements & Projects */}
      {(hasAchievements || hasProjects) && (
        <section className="py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Achievements */}
              {hasAchievements && (
                <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm">
                  <SectionTitle
                    icon={<Award className="h-5 w-5 text-yellow-600" />}
                    title="Achievements"
                  />
                  <ul className="space-y-4">
                    {club.achievements.map(
                      (achievement: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600/15">
                            <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-muted-foreground leading-relaxed">
                            {achievement}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}

              {/* Projects */}
              {hasProjects && (
                <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm">
                  <SectionTitle
                    icon={
                      <Rocket className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    }
                    title="Current Projects"
                  />
                  <ul className="space-y-4">
                    {club.projects.map((project: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-600/15">
                          <div className="h-2 w-2 rounded-full bg-purple-600" />
                        </div>
                        <span className="text-muted-foreground leading-relaxed">
                          {project}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Team Members */}
      {club.team && club.team.length > 0 && (
        <section className="py-16 lg:py-20 bg-muted/50">
          <div className="container px-4 md:px-6">
            <SectionTitle
              icon={
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              }
              title="Team Members"
              subtitle="The people behind the club"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {club.team.map((member: any, index: number) => (
                <div
                  key={index}
                  className="glass group relative overflow-hidden rounded-2xl border border-border/60 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/10">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-[3px] w-fit">
                    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl ring-4 ring-background">
                      {getInitials(member.name)}
                    </div>
                  </div>
                  <h4 className="font-semibold text-lg">{member.name}</h4>
                  <p className="text-sm text-muted-foreground mb-5">
                    {member.role}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-full">
                      <a href={`mailto:${member.email}`}>
                        <Mail className="mr-2 h-3 w-3" />
                        Email
                      </a>
                    </Button>
                    {member.phone && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="rounded-full">
                        <a href={`tel:${member.phone}`}>
                          <Phone className="mr-2 h-3 w-3" />
                          Call
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
