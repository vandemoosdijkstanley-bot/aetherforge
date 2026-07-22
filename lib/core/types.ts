import { z } from 'zod';

export type AgentRole = 'trendScout' | 'opportunitySynthesizer' | 'assetForger';

export const TrendSchema = z.object({
  name: z.string(),
  evidence: z.string(),
  momentumScore: z.number().min(1).max(10),
  opportunityWindow: z.string(),
  whyNow: z.string(),
});

export const PainSchema = z.object({
  description: z.string(),
  intensity: z.number().min(1).max(10),
  currentSolutions: z.string(),
  gap: z.string(),
});

export const TrendScoutOutputSchema = z.object({
  trends: z.array(TrendSchema),
  pains: z.array(PainSchema),
  platformLevers: z.array(z.string()),
  summaryInsight: z.string(),
});

export const OpportunitySchema = z.object({
  title: z.string(),
  pitch: z.string(),
  targetAvatar: z.string(),
  revenueModel: z.string(),
  estimatedMonthlyRevenueAt100: z.number(),
  difficulty: z.number().min(1).max(10),
  daysToFirstEuro: z.number(),
  uniqueInsight: z.string(),
  whyNow: z.string(),
  attractivenessScore: z.number().min(1).max(100),
});

export const OpportunitySynthesizerOutputSchema = z.array(OpportunitySchema);

export type TrendScoutOutput = z.infer<typeof TrendScoutOutputSchema>;
export type Opportunity = z.infer<typeof OpportunitySchema>;

export interface Genome {
  id: string;
  role: AgentRole;
  systemPrompt: string;
  temperature: number;
  fewShots?: string[];
  fitness: number; // EMA fitness
  generation: number;
  parentIds?: string[];
  metrics?: {
    marginPotential?: number;
    timeToFirstEuro?: number;
    uniqueness?: number;
  };
}

export interface RunInput {
  niche: string;
  goal?: string;
  constraints?: string;
  userApiKey: string;
  provider?: 'openai' | 'xai' | 'huggingface' | 'anthropic';
  baseURL?: string;
  modelId?: string;
}

export interface RunResult {
  trends: TrendScoutOutput;
  opportunities: Opportunity[];
  topOpportunity: Opportunity;
  assetsMarkdown: string;
  usedGenomes: {
    trendScout: string;
    opportunitySynthesizer: string;
    assetForger: string;
  };
}
