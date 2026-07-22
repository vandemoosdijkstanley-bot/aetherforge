/**
 * AetherForge Orchestrator – modern Vercel AI SDK pattern
 * generateText + Output.object + genome injection
 */

import { generateText, Output } from 'ai'
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

function createModel(
  apiKey: string,
  provider: RunInput['provider'] = 'openai',
  baseURL?: string
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
  // Default models – can later be evolved by genetics too
  const modelId =
    provider === 'xai' ? 'grok-2' : provider === 'huggingface' ? 'meta-llama/Llama-3.3-70B-Instruct' : 'gpt-4o'
  return openai(modelId)
}

function buildSystemPrompt(
  role: keyof typeof BASE_PROMPTS,
  genome?: Genome | null
): string {
  if (genome?.systemPrompt) return genome.systemPrompt
  return BASE_PROMPTS[role]
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

  // TrendScout – structured
  const { output: trends } = await generateText({
    model,
    system: buildSystemPrompt('trendScout', genomes.trendScout),
    temperature: genomes.trendScout?.temperature ?? 0.65,
    output: Output.object({
      schema: TrendScoutOutputSchema,
    }),
    prompt: userContext,
  })

  // OpportunitySynthesizer – structured
  const { output: rawOpportunities } = await generateText({
    model,
    system: buildSystemPrompt('opportunitySynthesizer', genomes.opportunitySynthesizer),
    temperature: genomes.opportunitySynthesizer?.temperature ?? 0.7,
    output: Output.object({
      schema: OpportunitySynthesizerOutputSchema,
    }),
    prompt: `${userContext}\n\nTrend intelligence:\n${JSON.stringify(trends, null, 2)}`,
  })

  const opportunities = rankOpportunities(rawOpportunities as Opportunity[])
  const topOpportunity = opportunities[0]

  // AssetForger – free text (Markdown package)
  const { text: assetsMarkdown } = await generateText({
    model,
    system: buildSystemPrompt('assetForger', genomes.assetForger),
    temperature: genomes.assetForger?.temperature ?? 0.55,
    prompt: `${userContext}\n\nSelected top opportunity:\n${JSON.stringify(topOpportunity, null, 2)}\n\nProduce the complete launch package now.`,
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
