"use client";

import * as React from "react";
import Link from "next/link";
import {
  Code2,
  Cpu,
  Rocket,
  Zap,
  Globe2,
  BrainCircuit,
  ArrowUpRight,
  Sparkles,
  Layers,
  Terminal,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardData {
  id: string;
  tag: string;
  category: "all" | "tech" | "hardware" | "ecosystem";
  title: string;
  highlight: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  borderHover: string;
  badgeColor: string;
  href: string;
  linkText: string;
  stats?: { value: string; label: string };
  colSpanClass: string;
  featured?: boolean;
}

const featuresData: FeatureCardData[] = [
  {
    id: "tech-excellence",
    tag: "SOFTWARE & SYSTEMS",
    category: "tech",
    title: "Full-Stack & Systems Engineering",
    highlight: "Engineering at scale",
    description:
      "From distributed cloud architectures and compilers to intuitive web experiences, our developers build production-grade open source platforms for campus and beyond.",
    icon: Code2,
    gradient: "from-blue-600/15 via-indigo-600/10 to-transparent",
    borderHover: "group-hover:border-blue-500/50",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    href: "/clubs/metis",
    linkText: "Explore Metis Club",
    stats: { value: "10+", label: "OSS Repositories" },
    colSpanClass: "lg:col-span-7",
    featured: true,
  },
  {
    id: "ai-frontier",
    tag: "INTELLIGENCE",
    category: "tech",
    title: "AI, Deep Learning & Vision",
    highlight: "Pushing frontier intelligence",
    description:
      "Tackling complex generative models, geospatial vision-language transformers, and state-of-the-art NLP algorithms for national competitions.",
    icon: BrainCircuit,
    gradient: "from-purple-600/15 via-pink-600/10 to-transparent",
    borderHover: "group-hover:border-purple-500/50",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    href: "/clubs/machine-learning",
    linkText: "Explore ML Club",
    stats: { value: "Top 3", label: "Inter-IIT ML Podium" },
    colSpanClass: "lg:col-span-5",
  },
  {
    id: "hardware-robotics",
    tag: "ROBOTICS & EMBEDDED",
    category: "hardware",
    title: "Robotics & Hardware Labs",
    highlight: "Autonomous machines & silicon",
    description:
      "Autonomous rovers, competitive robosoccer, custom PCB layout, firmware design, and rapid 3D prototyping at Tinkerers' Lab.",
    icon: Cpu,
    gradient: "from-amber-600/15 via-orange-600/10 to-transparent",
    borderHover: "group-hover:border-amber-500/50",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    href: "/clubs/mean-mechanics",
    linkText: "Explore Mean Mechanics",
    stats: { value: "24/7", label: "Maker Access" },
    colSpanClass: "lg:col-span-4",
  },
  {
    id: "hackathons-competitions",
    tag: "COMPETITIONS",
    category: "ecosystem",
    title: "High-Stakes Hackathons",
    highlight: "48 hours of rapid prototyping",
    description:
      "Hosting premier annual hackathons like Cronos and Summer Siege, connecting hundreds of student innovators with industry mentors and angel grants.",
    icon: Zap,
    gradient: "from-emerald-600/15 via-teal-600/10 to-transparent",
    borderHover: "group-hover:border-emerald-500/50",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    href: "/hackathons",
    linkText: "View Hackathons",
    stats: { value: "₹1L+", label: "Annual Cash Prizes" },
    colSpanClass: "lg:col-span-4",
  },
  {
    id: "startup-incubation",
    tag: "VENTURE & IMPACT",
    category: "ecosystem",
    title: "Startup & Innovation Culture",
    highlight: "From idea to funded venture",
    description:
      "Bridging the gap between academic innovation and commercial deployment with seed incubation, patent guidance, and founder networks.",
    icon: Rocket,
    gradient: "from-rose-600/15 via-red-600/10 to-transparent",
    borderHover: "group-hover:border-rose-500/50",
    badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    href: "/about",
    linkText: "Learn Our Mission",
    stats: { value: "5+", label: "Student Startups" },
    colSpanClass: "lg:col-span-4",
  },
  {
    id: "global-reach",
    tag: "RECOGNITION",
    category: "ecosystem",
    title: "National & Global Footprint",
    highlight: "Competing on the world stage",
    description:
      "Representing IIT Gandhinagar at the prestigious Inter-IIT Tech Meet, international Olympiads, and globally recognized research symposiums.",
    icon: Globe2,
    gradient: "from-cyan-600/15 via-blue-600/10 to-transparent",
    borderHover: "group-hover:border-cyan-500/50",
    badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    href: "/achievements",
    linkText: "See Achievements",
    stats: { value: "7", label: "Podium Finishes" },
    colSpanClass: "lg:col-span-12",
  },
];

export function FeaturesSection() {
  const [activeCategory, setActiveCategory] = React.useState<"all" | "tech" | "hardware" | "ecosystem">("all");
  const [mousePos, setMousePos] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null);

  const filteredFeatures = React.useMemo(() => {
    if (activeCategory === "all") return featuresData;
    return featuresData.filter((f) => f.category === activeCategory);
  }, [activeCategory]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setHoveredCard(id);
  };

  return (
    <section className="relative py-20 overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {/* Subtle decorative grid backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 sm:w-[32rem] h-96 bg-blue-500/5 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight font-space-grotesk text-gray-900 dark:text-gray-100">
            Why Choose Tech Council? <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Innovation</span>
          </h2>
          
          <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
            We are the hub of technical innovation at IIT Gandhinagar, fostering creativity, collaboration, and cutting-edge research across multiple domains.
          </p>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 rounded-full bg-gray-100/90 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 backdrop-blur shadow-xs">
            {(
              [
                { id: "all", label: "All Pillars", icon: Layers },
                { id: "tech", label: "Software & AI", icon: Terminal },
                { id: "hardware", label: "Hardware & Robotics", icon: Cpu },
                { id: "ecosystem", label: "Competitions & Ventures", icon: Trophy },
              ] as const
            ).map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 select-none",
                    isActive
                      ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xs font-semibold"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/60 dark:hover:bg-gray-700/50"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
          {filteredFeatures.map((item) => {
            const Icon = item.icon;
            const isHovered = hoveredCard === item.id;

            return (
              <div
                key={item.id}
                onMouseMove={(e) => handleMouseMove(e, item.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={cn(
                  "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1",
                  item.colSpanClass,
                  item.borderHover
                )}
              >
                {/* Dynamic Mouse Spotlight Glow */}
                {isHovered && (
                  <div
                    className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.12), transparent 80%)`,
                    }}
                  />
                )}

                {/* Top Ambient Card Gradient */}
                <div
                  className={cn(
                    "absolute top-0 right-0 w-3/4 h-1/2 bg-gradient-to-bl opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                    item.gradient
                  )}
                />

                {/* Card Header & Content */}
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    {/* Icon container */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 group-hover:scale-110 group-hover:border-blue-500/40 transition-all duration-300 shadow-xs">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300" />
                    </div>

                    {/* Tag badge */}
                    <span
                      className={cn(
                        "text-[10px] sm:text-xs font-mono font-semibold px-2.5 py-1 rounded-full border tracking-wide uppercase shadow-2xs",
                        item.badgeColor
                      )}
                    >
                      {item.tag}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400">
                      {item.highlight}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-space-grotesk tracking-tight text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Metrics & Navigation Link */}
                <div className="relative z-10 mt-6 pt-5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-4">
                  {item.stats ? (
                    <div className="flex flex-col">
                      <span className="text-xl font-bold font-space-grotesk tracking-tight text-gray-900 dark:text-gray-100">
                        {item.stats.value}
                      </span>
                      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                        {item.stats.label}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span>Active Community</span>
                    </div>
                  )}

                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 group/link hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span>{item.linkText}</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner / Invitation Card */}
        <div className="mt-12 sm:mt-16 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-900/90 dark:via-gray-800/60 dark:to-gray-900/90 p-8 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-xl sm:text-2xl font-bold font-space-grotesk text-gray-900 dark:text-gray-100">
              Ready to build something impactful with us?
            </h4>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-xl">
              Join any of our 11+ technical clubs, participate in high-adrenaline hackathons, or represent IIT Gandhinagar at Inter-IIT Tech Meet.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/clubs"
              className="bg-gradient-to-r px-5 py-2.5 from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-sm rounded-full transition-all duration-200 shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 flex items-center gap-2 select-none"
            >
              <span>Explore All Clubs</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/about"
              className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-sm rounded-full transition-all duration-200"
            >
              About Council
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
