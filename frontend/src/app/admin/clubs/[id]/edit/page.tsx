import EditClubPage from "./edit-page-client";

import { defaultClubsData } from "@/lib/clubs-data";

export async function generateStaticParams() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${API_URL}/api/clubs`);
    if (res.ok) {
      const clubs = await res.json();
      if (Array.isArray(clubs) && clubs.length > 0) {
        return clubs.map((club: any) => ({ id: String(club.id) }));
      }
    }
  } catch (error) {
    console.warn("Failed to fetch clubs from backend, using default static data", error);
  }

  return Object.keys(defaultClubsData).map((key) => ({
    id: key,
  }));
}

export default function Page() {
  return <EditClubPage />;
}
