import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { niche, userApiKey } = body

    if (!niche || !userApiKey) {
      return NextResponse.json(
        { error: 'niche and userApiKey are required' },
        { status: 400 }
      )
    }

    // Stub response while we stabilize the build.
    // Full orchestrator will be re-enabled after green deploy.
    return NextResponse.json({
      status: 'ok',
      message: 'AetherForge pipeline stub – full multi-agent engine will be re-enabled after successful deploy',
      niche,
      note: 'Genetic engine and orchestrator are present in the repo and ready',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Pipeline failed' },
      { status: 500 }
    )
  }
}
