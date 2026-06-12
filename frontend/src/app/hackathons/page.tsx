import { Metadata } from "next";
import { HackathonsClient } from "@/components/hackathons-client";

export const metadata: Metadata = {
  title: "Hackathons - Technical Council IITGN",
  description: "Explore upcoming, ongoing, and past hackathons organized by the Technical Council of IIT Gandhinagar.",
};

export default function HackathonsPage() {
  return <HackathonsClient />;
}
