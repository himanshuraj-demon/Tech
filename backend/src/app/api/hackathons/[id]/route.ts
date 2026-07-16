import { NextRequest, NextResponse } from 'next/server';
import { getHackathonById } from '@/lib/hackathons-storage';
import { db, eventRegistrations } from "@/lib/db";
import { eq, and, isNotNull, asc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hackathon = await getHackathonById(id);
    
    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      );
    }
    
    if (hackathon.status === 'completed') {
      const winners = await db
        .select()
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, id),
            isNotNull(eventRegistrations.winnerPlace)
          )
        )
        .orderBy(asc(eventRegistrations.winnerPlace));
      
      return NextResponse.json({
        ...hackathon,
        winners
      });
    }
    
    return NextResponse.json(hackathon);
  } catch (error) {
    console.error('Error fetching hackathon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hackathon' },
      { status: 500 }
    );
  }
}
