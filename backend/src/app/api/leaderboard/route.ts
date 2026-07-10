import { NextRequest, NextResponse } from "next/server";
import { db, eventRegistrations, hackathons } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // 1. Fetch all hackathons to lookup point values
    const allHackathons = await db.select().from(hackathons);
    const hackathonsMap = allHackathons.reduce((acc, h) => {
      acc[h.id] = h;
      return acc;
    }, {} as Record<string, typeof allHackathons[0]>);

    // 2. Fetch all event registrations (storing hackathon registrations)
    const allRegistrations = await db.select().from(eventRegistrations);

    // 3. Compile stats grouped by student email
    const leaderboardMap: Record<string, {
      email: string;
      name: string;
      score: number;
      participations: number;
      firstPlaces: number;
      secondPlaces: number;
      thirdPlaces: number;
      events: Array<{
        id: string;
        title: string;
        place: number | null;
        points: number;
      }>;
    }> = {};

    allRegistrations.forEach((reg) => {
      const email = reg.userEmail.toLowerCase();
      const hackathon = hackathonsMap[reg.eventId]; // column eventId stores hackathonId
      if (!hackathon) return; // Skip if hackathon no longer exists

      if (!leaderboardMap[email]) {
        leaderboardMap[email] = {
          email: reg.userEmail,
          name: reg.userName,
          score: 0,
          participations: 0,
          firstPlaces: 0,
          secondPlaces: 0,
          thirdPlaces: 0,
          events: [],
        };
      }

      const student = leaderboardMap[email];
      student.participations += 1;

      let pointsEarned = 0;
      if (reg.winnerPlace === 1) {
        pointsEarned = hackathon.points1st;
        student.firstPlaces += 1;
      } else if (reg.winnerPlace === 2) {
        pointsEarned = hackathon.points2nd;
        student.secondPlaces += 1;
      } else if (reg.winnerPlace === 3) {
        pointsEarned = hackathon.points3rd;
        student.thirdPlaces += 1;
      } else {
        pointsEarned = hackathon.pointsParticipation;
      }

      student.score += pointsEarned;
      student.events.push({
        id: hackathon.id,
        title: hackathon.name,
        place: reg.winnerPlace,
        points: pointsEarned,
      });
    });

    // 4. Convert map to sorted list
    const leaderboard = Object.values(leaderboardMap).sort((a, b) => b.score - a.score);

    return NextResponse.json(leaderboard, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Error compiling leaderboard:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
