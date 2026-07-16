import { NextRequest, NextResponse } from 'next/server';
import { getHackathonsForDisplay, getHackathonsCount, getBasicHackathonStats } from '@/lib/hackathons-storage';
import { getHackathonsVisibility } from '@/lib/site-settings';

export async function GET(request: NextRequest) {
  try {
    // Check if hackathons section is visible
    const isVisible = await getHackathonsVisibility();

    if (!isVisible) {
      return NextResponse.json(
        { error: 'Hackathons section is currently disabled' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;
    const status = searchParams.get('status');
    const statsOnly = searchParams.get('statsOnly') === 'true';

    if (statsOnly) {
      const stats = await getBasicHackathonStats();
      return NextResponse.json({
        stats,
        visible: isVisible
      });
    }

    if (status === 'upcoming' || status === 'ongoing' || status === 'completed') {
      const { getHackathonsByStatus } = await import('@/lib/hackathons-storage');
      const allForStatus = await getHackathonsByStatus(status);
      const total = allForStatus.length;
      const sliced = allForStatus.slice(offset ?? 0, (offset ?? 0) + (limit ?? 6));
      return NextResponse.json({
        hackathons: sliced,
        total,
      });
    }

    const hackathons = await getHackathonsForDisplay(limit, offset);
    const total = await getHackathonsCount();
    const stats = await getBasicHackathonStats();

    return NextResponse.json({
      hackathons,
      total,
      stats,
      visible: isVisible
    });
  } catch (error) {
    console.error('Error fetching hackathons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hackathons' },
      { status: 500 }
    );
  }
}
