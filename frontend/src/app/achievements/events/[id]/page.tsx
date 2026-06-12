import { Metadata } from "next";
import { EventDetailClient } from "@/components/event-detail-client";

export const metadata: Metadata = {
  title: "Event Details - Technical Council IITGN",
  description: "View details of events organized by the Technical Council of IIT Gandhinagar.",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

import { defaultEventsData } from "@/lib/events-data";
import { api } from "../../../../../services/api";

export async function generateStaticParams() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await api.fetch(`${API_URL}/api/events`);
    if (res.ok) {
      const events = await res.json();
      if (Array.isArray(events) && events.length > 0) {
        return events.map((event: any) => ({ id: String(event.id) }));
      }
    }
  } catch (error) {
    console.warn("Failed to fetch events from backend, using default static data", error);
  }

  return Object.keys(defaultEventsData).map((key) => ({
    id: key,
  }));
}

export default async function EventDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <EventDetailClient id={resolvedParams.id} />;
}
