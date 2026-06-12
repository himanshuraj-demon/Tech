import { Metadata } from "next";
import { AboutClient } from "@/components/about-client";

export const metadata: Metadata = {
  title: "About Us - Technical Council IITGN",
  description: "Learn about the Technical Council of IIT Gandhinagar, our mission, vision, and plans for fostering innovation.",
};

export default function AboutPage() {
  return <AboutClient />;
}
