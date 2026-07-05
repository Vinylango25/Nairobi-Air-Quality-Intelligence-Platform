import { NextRequest, NextResponse } from 'next/server';
import { getAIRecommendation } from '@/lib/ai';
import type { HealthProfile } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { subcounty, profile } = await req.json();
    if (!subcounty || !profile) {
      return NextResponse.json({ error: 'Missing subcounty or profile' }, { status: 400 });
    }
    const recommendation = await getAIRecommendation(subcounty, profile as HealthProfile);
    return NextResponse.json(recommendation);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
