import { z } from 'zod'

export type AgentRole = 'trendScout' | 'opportunitySynthesizer' | 'assetForger'

export const TrendSchema = z.object({
  name: z.string().describe('Short, specific name of the trend'),
  evidence: z.string().describe('Concrete evidence or signal supporting the trend'),
  momentumScore: z.number().min(1).max(10).describe('1-10 score of current momentum'),
  opportunityWindow: z.string().describe('Estimated time window where this is still actionable'),
  whyNow: z.string().optional().describe('Why this moment is particularly good'),
})

export const PainSchema = z.object({
  description: z.string().describe('Clear description of the pain point'),
  intensity: z.number().min(1).max(10).describe('How painful this is for the target (1-10)'),
  currentSolutions: z.string().describe('How people currently solve or work around this'),
  gap: z.string().describe('What is still missing or imperfect'),
})

export const TrendScoutOutputSchema = z.object({
  trends: z.array(TrendSchema).min(3).max(6),
  pains: z.array(PainSchema).min(2).max(5),
  platformLevers: z.array(z.string()).describe('Platforms, APIs or channels that can be leveraged'),
  summaryInsight: z.string().describe('One sharp overall insight'),
})

export const OpportunitySchema = z.object({
  title: z.string().describe('Clear, specific opportunity title'),
  pitch: z.string().describe('One-sentence pitch'),
  targetAvatar: z.string().describe('Who exactly will pay for this'),
  revenueModel: z.string().describe('How money is made (prefer recurring)'),
  estimatedMonthlyRevenueAt100: z.number().describe('Estimated MRR at 100 customers'),
  difficulty: z.number().min(1).max(10).describe('1 = very easy, 10 = very hard for a solo founder'),
  daysToFirstEuro: z.number().describe('Realistic days until first paid customer'),
  uniqueInsight: z.string().describe('What makes this non-obvious'),
  whyNow: z.string().describe('Why this is timely'),
  attractivenessScore: z.number().min(1).max(100).describe('Overall attractiveness 1-100'),
})

export const OpportunitySynthesizerOutputSchema = z
  .array(OpportunitySchema)
  .min(3)
  .max(6)

export type TrendScoutOutput = z.infer<typeof TrendScoutOutputSchema>
export type Opportunity = z.infer<typeof OpportunitySchema>

export interface RunInput {
  niche: string
  goal?: string
  constraints?: string
  userApiKey: string
  provider?: 'openai' | 'xai' | 'huggingface'
  baseURL?: string
  modelId?: string
}

export interface RunResult {
  trends: TrendScoutOutput
  opportunities: Opportunity[]
  topOpportunity: Opportunity
  assetsMarkdown: string
  usedGenomes: {
    trendScout: string
    opportunitySynthesizer: string
    assetForger: string
  }
}

export interface Genome {
  id: string
  role: AgentRole
  systemPrompt: string
  temperature: number
  fewShots: string[]
  fitness: number
  generation: number
  mutations: string[]
  createdAt: number
  usageCount: number
}
