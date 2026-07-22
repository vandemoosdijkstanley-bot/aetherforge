import { NextRequest, NextResponse } from 'next/server';
import { runOpportunityPipeline } from '@/lib/agents/orchestrator';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { niche, goal, userApiKey, provider = 'openai' } = body;

    if (!niche || typeof niche !== 'string') {
      return NextResponse.json(
        { error: 'niche is required' },
        { status: 400 }
      );
    }

    // In production the key should come from the authenticated user session
    // or encrypted storage. For the autonomous MVP we accept it in the body.
    const result = await runOpportunityPipeline({
      niche,
      goal: goal || `Generate the highest-ROI opportunity in ${niche}`,
      userApiKey: userApiKey || process.env.OPENAI_API_KEY || process.env.XAI_API_KEY,
      provider,
    });

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[AetherForge] Pipeline error:', error);
    return NextResponse.json(
      { error: error.message || 'Pipeline failed' },
      { status: 500 }
    );
  }
}
