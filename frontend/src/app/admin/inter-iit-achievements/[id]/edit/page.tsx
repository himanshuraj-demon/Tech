import { api } from "../../../../../../services/api";
import EditInterIITAchievementPage from "./edit-page-client";

import { defaultAchievementsData } from "@/lib/inter-iit-achievements-data";

export async function generateStaticParams() {
  try {
    const res = await api.fetch(`/api/inter-iit-achievements`);
    if (res.ok) {
      const achievements = await res.json();
      if (Array.isArray(achievements) && achievements.length > 0) {
        return achievements.map((achievement: any) => ({ id: String(achievement.id) }));
      }
    }
  } catch (error) {
    console.warn("Failed to fetch achievements from backend, using default static data", error);
  }

  return Object.keys(defaultAchievementsData).map((key) => ({
    id: key,
  }));
}

export default function Page() {
  return <EditInterIITAchievementPage />;
}
