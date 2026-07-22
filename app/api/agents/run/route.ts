import { NextRequest, NextResponse } from 'next/server'
import { runOpportunityPipeline } from '@/lib/agents/orchestrator'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { niche, goal, constraints, userApiKey, provider, genomes } = body

    if (!niche || !userApiKey) {
      return NextResponse.json(
        { error: 'niche and userApiKey are required' },
        { status: 400 }
      )
    }

    const result = await runOpportunityPipeline(
      {
        niche,
        goal: goal || 'High-potential solo-founder revenue opportunities',
        constraints: constraints || 'Digital, high-margin, fast time-to-first-euro',
        userApiKey,
        provider: provider || 'openai',
      },
      genomes || {}
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('AetherForge run error:', error)
    return NextResponse.json(
      { error: error.message || 'Pipeline failed' },
      { status: 500 }
    )
  }
}
