/**
 * AetherForge Orchestrator
 * Vercel AI SDK + genome injection – core of the autonomous engine
 */

import { generateObject, generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { BASE_PROMPTS } from '../prompts'
import {
  TrendScoutOutputSchema,
  OpportunitySynthesizerOutputSchema,
  type RunInput,
  type RunResult,
  type Opportunity,
} from './types'
import { rankOpportunities } from '../scoring'
import type { Genome } from '../genetic'

function createModel(apiKey: string, provider: RunInput['provider'] = 'openai', baseURL?: string) {
  const openai = createOpenAI({
    apiKey,
    baseURL: baseURL || (provider === 'xai' ? 'https://api.x.ai/v1' : provider === 'huggingface' ? 'https://router.huggingface.co/v1' : undefined),
  })
  return openai(provider === 'xai' ? 'grok-2' : 'gpt-4o')
}

function buildSystemPrompt(role: keyof typeof BASE_PROMPTS, genome?: Genome | null): string {
  if (!genome || !genome.systemPrompt) return BASE_PROMPTS[role]
  return genome.systemPrompt
}

export async function runOpportunityPipeline(
  input: RunInput,
  genomes: {
    trendScout?: Genome | null
    opportunitySynthesizer?: Genome | null
    assetForger?: Genome | null
  } = {}
): Promise<RunResult> {
  const model = createModel(input.userApiKey, input.provider, input.baseURL)

  const userContext = `Niche: ${input.niche}\nGoal: ${input.goal || 'High-potential solo-founder revenue opportunities'}\nConstraints: ${input.constraints || 'Digital, high-margin, fast time-to-first-euro'}`

  const { object: trends } = await generateObject({
    model,
    schema: TrendScoutOutputSchema,
    system: buildSystemPrompt('trendScout', genomes.trendScout),
    prompt: userContext,
    temperature: genomes.trendScout?.temperature ?? 0.65,
  })

  const { object: rawOpportunities } = await generateObject({
    model,
    schema: OpportunitySynthesizerOutputSchema,
    system: buildSystemPrompt('opportunitySynthesizer', genomes.opportunitySynthesizer),
    prompt: `${userContext}\n\nTrend intelligence:\n${JSON.stringify(trends, null, 2)}`,
    temperature: genomes.opportunitySynthesizer?.temperature ?? 0.7,
  })

  const opportunities = rankOpportunities(rawOpportunities as Opportunity[])
  const topOpportunity = opportunities[0]

  const { text: assetsMarkdown } = await generateText({
    model,
    system: buildSystemPrompt('assetForger', genomes.assetForger),
    prompt: `${userContext}\n\nSelected top opportunity:\n${JSON.stringify(topOpportunity, null, 2)}\n\nProduce the complete launch package now.`,
    temperature: genomes.assetForger?.temperature ?? 0.55,
  })

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
}

export { createModel, buildSystemPrompt }
