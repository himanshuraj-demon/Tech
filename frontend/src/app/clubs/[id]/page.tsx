import { Metadata } from "next";
import ClubDetailPage from "./club-detail-client";

export const metadata: Metadata = {
  title: "Club Details - Technical Council IITGN",
  description: "View details of clubs and hobby groups under the Technical Council of IIT Gandhinagar.",
};

export async function generateStaticParams() {
  return [{ id: "1" }];
}

export default function Page() {
  return <ClubDetailPage />;
}