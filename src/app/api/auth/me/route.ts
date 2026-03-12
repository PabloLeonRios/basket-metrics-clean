// src/app/api/auth/me/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Team from '@/lib/models/Team';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const verified = await verifyAuth(token);

  if (verified.success && verified.payload) {
    let payloadWithLogoUrl = verified.payload;

    // Fetch team logoUrl if user has a team but no logoUrl in the token
    if (
      verified.payload.team &&
      typeof verified.payload.team === 'object' &&
      !verified.payload.team.logoUrl
    ) {
      await dbConnect();
      const teamId =
        verified.payload.team._id ||
        (verified.payload.team as unknown as Record<string, unknown>).id;
      if (teamId) {
        try {
          const team = await Team.findById(teamId).select('logoUrl').lean();
          if (team && team.logoUrl) {
            payloadWithLogoUrl = {
              ...verified.payload,
              team: {
                ...verified.payload.team,
                logoUrl: team.logoUrl,
              },
            };
          }
        } catch (error) {
          console.error('Error fetching team logoUrl:', error);
          // Continue returning the payload without logoUrl on error
        }
      }
    }

    return NextResponse.json(
      { success: true, data: payloadWithLogoUrl },
      { status: 200 },
    );
  } else {
    return NextResponse.json(
      { success: false, message: verified.message },
      { status: 401 },
    );
  }
}
