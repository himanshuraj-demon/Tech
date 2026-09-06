import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"

interface Club {
  id: string;
  name: string;
  description: string;
  type: "club" | "hobby-group" | "technical-council-group";
  category: string;
  logoPath?: string;
}

interface ClubCardProps {
  club: Club;
  variant?: "technical" | "hobby" | "council";
}

// Helper function to get logo path
const getLogoPath = (club: Club) => {
  if (club.logoPath) {
    return club.logoPath;
  }

  // Fallback to static logo mapping for existing clubs
  const logoMap: Record<string, string> = {
    // Technical Clubs
    'metis': '/logos/clubs/metis.jpeg',
    'digis': '/logos/clubs/digis.jpg',
    'mean-mechanics': '/logos/clubs/mean-mechanics.png',
    'odyssey': '/logos/clubs/odyssey.jpg',
    'grasp': '/logos/clubs/grasp.png',
    'machine-learning': '/logos/clubs/machine-learning.jpeg',
    'tinkerers-lab': '/logos/clubs/tinkerers-lab.png',
    'anveshanam': '/logos/clubs/anveshanam.png',

    // Hobby Groups
    'embed': '/logos/hobby-groups/embed.png',
    'blockchain-hobby': '/logos/hobby-groups/blockchain-hobby.png',
  }

  return logoMap[club.id] || null
}

// Get badge and highlight colors based on variant
const getVariantTheme = (variant: "technical" | "hobby" | "council") => {
  switch (variant) {
    case "technical":
      return {
        badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        hoverText: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
        borderHover: "group-hover:border-blue-500/40",
        ambientGlow: "from-blue-600/10 to-purple-600/10",
        typeLabel: "Technical Club",
      };
    case "hobby":
      return {
        badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        hoverText: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
        borderHover: "group-hover:border-purple-500/40",
        ambientGlow: "from-purple-600/10 to-pink-600/10",
        typeLabel: "Hobby Group",
      };
    case "council":
      return {
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        hoverText: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
        borderHover: "group-hover:border-emerald-500/40",
        ambientGlow: "from-emerald-600/10 to-teal-600/10",
        typeLabel: "Council Group",
      };
    default:
      return {
        badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        hoverText: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
        borderHover: "group-hover:border-blue-500/40",
        ambientGlow: "from-blue-600/10 to-purple-600/10",
        typeLabel: "Club",
      };
  }
}

export function ClubCard({ club, variant = "technical" }: ClubCardProps) {
  const theme = getVariantTheme(variant);

  return (
    <Link
      href={`/clubs/${club.id}`}
      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
    >
      <div
        className={`relative h-full flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 ${theme.borderHover}`}
      >
        {/* Ambient Top Glow on Hover */}
        <div
          className={`absolute top-0 right-0 w-3/4 h-1/2 bg-gradient-to-bl ${theme.ambientGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
        />

        <div>
          {/* Card Top Row: Logo + Badge + Arrow */}
          <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 p-2 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-2xs">
              {getLogoPath(club) ? (
                <Image
                  src={getLogoPath(club)!}
                  alt={`${club.name} logo`}
                  width={64}
                  height={64}
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="text-base font-bold text-gray-500 dark:text-gray-400">${club.name.split(" ").map((w: string) => w[0]).join("")}</div>`;
                    }
                  }}
                />
              ) : (
                <div className="text-base font-bold text-gray-500 dark:text-gray-400">
                  {club.name
                    .split(" ")
                    .map((word: string) => word[0])
                    .join("")
                    .slice(0, 3)}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${theme.badge}`}
              >
                {club.category || theme.typeLabel}
              </span>
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 group-hover:bg-gray-200/70 dark:group-hover:bg-gray-700 transition-colors">
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <div className="relative z-10 space-y-2">
            <h3
              className={`text-lg sm:text-xl font-bold font-space-grotesk tracking-tight text-gray-900 dark:text-gray-100 transition-colors duration-200 line-clamp-1 ${theme.hoverText}`}
            >
              {club.name}
            </h3>

            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-3">
              {club.description}
            </p>
          </div>
        </div>

        {/* Card Footer: Subtle prompt */}
        <div className="relative z-10 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs">
          <span className="font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
            View club details & projects
          </span>
          <span className={`font-semibold ${theme.hoverText} transition-colors`}>
            Explore &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
