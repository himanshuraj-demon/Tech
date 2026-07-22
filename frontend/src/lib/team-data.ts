export interface TeamMember {
  id: string;
  name: string;
  position: string;
  email: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  category: string;
  photoPath?: string;
  isSecretary?: boolean;
  isCoordinator?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Default team members data
export const defaultTeamData: Record<string, TeamMember> = {
  "naveen-pal": {
    id: "naveen-pal",
    name: "Naveen Pal",
    position: "Technical Secretary",
    email: "naveen.pal@iitgn.ac.in",
    initials: "NP",
    gradientFrom: "from-blue-600",
    gradientTo: "to-purple-600",
    category: "leadership",
    photoPath: "/team/Naveen-Pal.jpg",
    isSecretary: true,
    isCoordinator: false,
    createdAt: "2026-07-22T20:15:40.000Z",
    updatedAt: "2026-07-22T20:15:40.000Z"
  },
  "kalp-shah": {
    id: "kalp-shah",
    name: "Kalp Shah",
    position: "Technical Coordinator",
    email: "kalp.shah@iitgn.ac.in",
    initials: "KS",
    gradientFrom: "from-purple-600",
    gradientTo: "to-pink-600",
    category: "coordinator",
    photoPath: "/team/Kalp-Shah.jpg",
    isSecretary: false,
    isCoordinator: true,
    createdAt: "2026-07-22T20:15:40.000Z",
    updatedAt: "2026-07-22T20:15:40.000Z"
  },
  "rathod-yuvraj": {
    id: "rathod-yuvraj",
    name: "Rathod Yuvraj Rajubhai",
    position: "Technical Coordinator",
    email: "rathod.yuvraj@iitgn.ac.in",
    initials: "RY",
    gradientFrom: "from-indigo-600",
    gradientTo: "to-purple-600",
    category: "coordinator",
    photoPath: "/team/Rathod-Yuvraj.jpg",
    isSecretary: false,
    isCoordinator: true,
    createdAt: "2026-07-22T20:15:40.000Z",
    updatedAt: "2026-07-22T20:15:40.000Z"
  },
  "janil-jain": {
    id: "janil-jain",
    name: "Janil Jain",
    position: "Management Coordinator",
    email: "janil.jain@iitgn.ac.in",
    initials: "JJ",
    gradientFrom: "from-green-600",
    gradientTo: "to-teal-600",
    category: "coordinator",
    photoPath: "/team/Janil-Jain.jpg",
    isSecretary: false,
    isCoordinator: true,
    createdAt: "2026-07-22T20:15:40.000Z",
    updatedAt: "2026-07-22T20:15:40.000Z"
  },
  "srushti-dandekar": {
    id: "srushti-dandekar",
    name: "Srushti Dandekar",
    position: "Outreach Coordinator",
    email: "srushti.dandekar@iitgn.ac.in",
    initials: "SD",
    gradientFrom: "from-emerald-600",
    gradientTo: "to-cyan-600",
    category: "coordinator",
    photoPath: "/team/Srushti-Dandekar.jpg",
    isSecretary: false,
    isCoordinator: true,
    createdAt: "2026-07-22T20:15:40.000Z",
    updatedAt: "2026-07-22T20:15:40.000Z"
  },
  "vishal-boliwal": {
    id: "vishal-boliwal",
    name: "Vishal Boliwal",
    position: "Website, Social Media and Design Lead",
    email: "vishal.boliwal@iitgn.ac.in",
    initials: "VB",
    gradientFrom: "from-orange-600",
    gradientTo: "to-red-600",
    category: "coordinator",
    photoPath: "/team/Vishal-Boliwal.jpg",
    isSecretary: false,
    isCoordinator: true,
    createdAt: "2026-07-22T20:15:40.000Z",
    updatedAt: "2026-07-22T20:15:40.000Z"
  }
};

// Team member categories
export const teamCategories = [
  { id: "leadership", name: "Leadership", color: "blue" },
  { id: "coordinator", name: "Coordinators", color: "purple" },
  { id: "general", name: "General Council Members", color: "green" },
  { id: "design", name: "Design Team", color: "pink" },
  { id: "social", name: "Social Media Team", color: "orange" }
];

// Position types
export const positionTypes = [
  "Technical Secretary",
  "Technical Coordinator",
  "Management Coordinator",
  "Outreach Coordinator",
  "Website/Social Media/Design Lead",
  "General Member",
  "Design Team",
  "Social Media Team"
];

// Position to category mapping
export const positionCategoryMapping: Record<string, string> = {
  "Technical Secretary": "leadership",
  "Technical Coordinator": "coordinator",
  "Management Coordinator": "coordinator",
  "Outreach Coordinator": "coordinator",
  "Website/Social Media/Design Lead": "coordinator",
  "General Member": "general",
  "Design Team": "design",
  "Social Media Team": "social"
};

// Helper function to get category from position
export function getCategoryFromPosition(position: string): string {
  return positionCategoryMapping[position] || "general";
}

// Helper function to check if position is secretary
export function isSecretaryPosition(position: string): boolean {
  return position.toLowerCase().includes("secretary");
}

// Helper function to check if position is coordinator
export function isCoordinatorPosition(position: string): boolean {
  return position.toLowerCase().includes("coordinator") ||
         position === "Website/Social Media/Design Lead";
}

// Gradient color options
export const gradientOptions = [
  { from: "from-blue-600", to: "to-indigo-600", name: "Blue to Indigo" },
  { from: "from-purple-600", to: "to-pink-600", name: "Purple to Pink" },
  { from: "from-green-600", to: "to-teal-600", name: "Green to Teal" },
  { from: "from-orange-600", to: "to-red-600", name: "Orange to Red" },
  { from: "from-cyan-600", to: "to-blue-600", name: "Cyan to Blue" },
  { from: "from-violet-600", to: "to-purple-600", name: "Violet to Purple" },
  { from: "from-emerald-600", to: "to-teal-600", name: "Emerald to Teal" },
  { from: "from-rose-600", to: "to-pink-600", name: "Rose to Pink" }
];
