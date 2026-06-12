import EditMagazinePage from "./edit-page-client";

import { defaultTorqueData } from "@/lib/torque-data";

export async function generateStaticParams() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${API_URL}/api/torque`);
    if (res.ok) {
      const magazines = await res.json();
      if (Array.isArray(magazines) && magazines.length > 0) {
        return magazines.map((magazine: any) => ({ id: String(magazine.id) }));
      }
    }
  } catch (error) {
    console.warn("Failed to fetch torque from backend, using default static data", error);
  }

  return Object.keys(defaultTorqueData).map((key) => ({
    id: key,
  }));
}

export default function Page() {
  return <EditMagazinePage />;
}
