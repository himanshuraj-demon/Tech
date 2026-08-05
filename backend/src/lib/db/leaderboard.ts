import { leaderboard, hackathons, eventRegistrations } from "./schema";
import { eq } from "drizzle-orm";

export async function rebuildLeaderboard(tx: any) {
  // 1. Fetch all active (non-deleted) hackathons to lookup point values
  const allHackathons = await tx
    .select()
    .from(hackathons)
    .where(eq(hackathons.deleted, false));
    
  const hackathonsMap = allHackathons.reduce((acc: any, h: any) => {
    acc[h.id] = h;
    return acc;
  }, {});

  // 2. Fetch all event registrations
  const allRegistrations = await tx.select().from(eventRegistrations);

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
      placeName: string | null;
      points: number;
    }>;
  }> = {};

  allRegistrations.forEach((reg: any) => {
    const email = reg.userEmail.toLowerCase();
    const hackathon = hackathonsMap[reg.eventId]; // column eventId stores hackathonId
    if (!hackathon) return; // Skip if hackathon no longer exists

    // ONLY award points if the hackathon is completed/ended!
    if (hackathon.status !== 'completed') return;

    const hasSubmission = !!(reg.githubLink?.trim() || reg.docsLink?.trim());

    // Skip registrations that never submitted a project and aren't a declared winner
    if (!hasSubmission && !reg.winnerPlace) return;

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
    let placeName: string | null = null;

    if (reg.winnerPlace) {
      const tier = (hackathon.winnerTiers as any[])?.find((t: any) => t.rank === reg.winnerPlace);
      if (tier) {
        pointsEarned = Number(tier.points);
        placeName = tier.name;
        if (reg.winnerPlace === 1) student.firstPlaces += 1;
        else if (reg.winnerPlace === 2) student.secondPlaces += 1;
        else if (reg.winnerPlace === 3) student.thirdPlaces += 1;
      } else {
        pointsEarned = hasSubmission ? hackathon.pointsParticipation : 0;
      }
    } else {
      pointsEarned = hasSubmission ? hackathon.pointsParticipation : 0;
    }

    student.score += pointsEarned;
    student.events.push({
      id: hackathon.id,
      title: hackathon.name,
      place: reg.winnerPlace,
      placeName: placeName,
      points: pointsEarned,
    });
  });

  // Filter out users with 0 points (point 0 should not be stored)
  const leaderboardList = Object.values(leaderboardMap).filter((s) => s.score > 0);

  // Clear existing leaderboard within the transaction
  await tx.delete(leaderboard);

  // Insert compiled records in batch
  if (leaderboardList.length > 0) {
    await tx.insert(leaderboard).values(
      leaderboardList.map((student) => ({
        email: student.email.toLowerCase(),
        name: student.name,
        score: student.score,
        participations: student.participations,
        firstPlaces: student.firstPlaces,
        secondPlaces: student.secondPlaces,
        thirdPlaces: student.thirdPlaces,
        events: student.events,
        updatedAt: new Date(),
      }))
    );
  }
}
