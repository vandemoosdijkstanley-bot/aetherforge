/**
 * AetherForge Orchestrator
 * Modern Vercel AI SDK pattern (generateText + Output.object) + genome injection
 * Imports exclusively from lib/core
 */

import { generateText, Output } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { BASE_PROMPTS } from '../core/prompts'
import {
  TrendScoutOutputSchema,
  OpportunitySynthesizerOutputSchema,
  type RunInput,
  type RunResult,
  type Opportunity,
  type Genome,
} from '../core/types'
import { rankOpportunities } from '../core/scoring'

function createModel(
  apiKey: string,
  provider: RunInput['provider'] = 'openai',
  baseURL?: string,
  modelId?: string
) {
  const openai = createOpenAI({
    apiKey,
    baseURL:
      baseURL ||
      (provider === 'xai'
        ? 'https://api.x.ai/v1'
        : provider === 'huggingface'
          ? 'https://router.huggingface.co/v1'
          : undefined),
  })
  const id = modelId || (provider === 'xai' ? 'grok-2' : 'gpt-4o')
  return openai(id)
}

function buildSystemPrompt(
  role: keyof typeof BASE_PROMPTS,
  genome?: Genome | null
): string {
  if (genome?.systemPrompt) return genome.systemPrompt
  return BASE_PROMPTS[role]
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (i < retries) {
        await new Promise((r) => setTimeout(r, 400 * (i + 1)))
      }
    }
  }
  throw lastError
}

export async function runOpportunityPipeline(
  input: RunInput,
  genomes: {
    trendScout?: Genome | null
    opportunitySynthesizer?: Genome | null
    assetForger?: Genome | null
  } = {}
): Promise<RunResult> {
  if (!input.niche || !input.userApiKey) {
    throw new Error('niche and userApiKey are required')
  }

  const model = createModel(input.userApiKey, input.provider, input.baseURL, input.modelId)

  const userContext = `Niche: ${input.niche}\nGoal: ${input.goal || 'High-potential solo-founder revenue opportunities'}\nConstraints: ${input.constraints || 'Digital, high-margin, fast time-to-first-euro'}`

  try {
    // TrendScout
    const { output: trends } = await withRetry(() =>
      generateText({
        model,
        system: buildSystemPrompt('trendScout', genomes.trendScout),
        temperature: genomes.trendScout?.temperature ?? 0.65,
        output: Output.object({ schema: TrendScoutOutputSchema }),
        prompt: userContext,
      })
    )

    // OpportunitySynthesizer
    const { output: rawOpportunities } = await withRetry(() =>
      generateText({
        model,
        system: buildSystemPrompt('opportunitySynthesizer', genomes.opportunitySynthesizer),
        temperature: genomes.opportunitySynthesizer?.temperature ?? 0.7,
        output: Output.object({ schema: OpportunitySynthesizerOutputSchema }),
        prompt: `${userContext}\n\nTrend intelligence:\n${JSON.stringify(trends, null, 2)}`,
      })
    )

    const opportunities = rankOpportunities(rawOpportunities as Opportunity[])
    const topOpportunity = opportunities[0]

    if (!topOpportunity) {
      throw new Error('No opportunities generated')
    }

    // AssetForger
    const { text: assetsMarkdown } = await withRetry(() =>
      generateText({
        model,
        system: buildSystemPrompt('assetForger', genomes.assetForger),
        temperature: genomes.assetForger?.temperature ?? 0.55,
        prompt: `${userContext}\n\nSelected top opportunity:\n${JSON.stringify(topOpportunity, null, 2)}\n\nProduce the complete launch package now.`,
      })
    )

    return {
      trends,
      opportunities,
      topOpportunity,
      assetsMarkdown,
      usedGenomes: {
        trendScout: genomes.trendScout?.id ?? 'base',
        opportunitySynthesizer: genomes.opportunitySynthesizer?.id ?? 'base',
        assetForger: genomes.assetForger?.id ?? 'base',
      },
    }
  } catch (error: any) {
    console.error('[AetherForge] Pipeline error:', error)
    throw new Error(error?.message || 'Opportunity pipeline failed')
  }
}

export { createModel, buildSystemPrompt }
