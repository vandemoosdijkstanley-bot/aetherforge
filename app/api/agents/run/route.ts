import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { runOpportunityPipeline } from '@/lib/agents/orchestrator'

export const maxDuration = 60

const RequestSchema = z.object({
  niche: z.string().min(3, 'niche must be at least 3 characters'),
  goal: z.string().optional(),
  constraints: z.string().optional(),
  userApiKey: z.string().min(10, 'userApiKey is required'),
  provider: z.enum(['openai', 'anthropic', 'xai', 'huggingface']).optional().default('openai'),
  baseURL: z.string().url().optional(),
  modelId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = RequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { niche, goal, constraints, userApiKey, provider, baseURL, modelId } = parsed.data

    const result = await runOpportunityPipeline(
      {
        niche,
        goal,
        constraints,
        userApiKey,
        provider,
        baseURL,
        modelId,
      },
      {} // genomes will be injected later when feedback loop is ready
    )

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[AetherForge API] Pipeline error:', error)

    // Explicit handling for structured output / generation failures
    const message = error?.message || 'Pipeline failed'
    const isStructuredFailure =
      message.includes('No object generated') ||
      message.includes('could not parse') ||
      message.includes('structured')

    return NextResponse.json(
      {
        error: isStructuredFailure
          ? 'Structured output generation failed. Please try again or adjust the niche.'
          : message,
        retryable: true,
      },
      { status: 500 }
    )
  }
}
