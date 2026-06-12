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

export async function generateStaticParams() {
  return [{ id: "1" }];
}

export default async function EventDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <EventDetailClient id={resolvedParams.id} />;
}
