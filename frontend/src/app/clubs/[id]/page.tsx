import { Metadata } from "next";
import ClubDetailPage from "./club-detail-client";

import { defaultClubsData } from "@/lib/clubs-data";

export const metadata: Metadata = {
  title: "Club Details - Technical Council IITGN",
  description: "View details of clubs and hobby groups under the Technical Council of IIT Gandhinagar.",
};

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
  return <ClubDetailPage />;
}