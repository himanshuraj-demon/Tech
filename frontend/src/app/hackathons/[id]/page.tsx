import { Metadata } from "next";
import { HackathonDetailClient } from "@/components/hackathon-detail-client";

export const metadata: Metadata = {
  title: "Hackathon Details - Technical Council IITGN",
  description: "Explore details of hackathons organized by the Technical Council of IIT Gandhinagar.",
};

interface HackathonPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  return [{ id: "1" }];
}

export default async function HackathonPage({ params }: HackathonPageProps) {
  const resolvedParams = await params;
  return <HackathonDetailClient id={resolvedParams.id} />;
}
