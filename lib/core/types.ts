import { z } from 'zod';

export type AgentRole = 'trendScout' | 'opportunitySynthesizer' | 'assetForger';

export const TrendSchema = z.object({
  name: z.string().min(3).describe('Short, concrete trend name'),
  evidence: z.string().min(10).describe('Specific evidence or signal supporting the trend'),
  momentumScore: z.number().min(1).max(10).describe('1-10 momentum strength'),
  opportunityWindow: z.string().describe('How long the window is likely open'),
  whyNow: z.string().optional().describe('Why this is timely right now'),
});

export const PainSchema = z.object({
  description: z.string().min(10),
  intensity: z.number().min(1).max(10),
  currentSolutions: z.string(),
  gap: z.string().describe('What is missing in current solutions'),
});

export const TrendScoutOutputSchema = z.object({
  trends: z.array(TrendSchema).min(3).max(8),
  pains: z.array(PainSchema).min(2).max(6),
  platformLevers: z.array(z.string()).min(1),
  summaryInsight: z.string().min(20).describe('One high-signal insight that connects the trends and pains'),
});

export const OpportunitySchema = z.object({
  title: z.string().min(5),
  pitch: z.string().min(20),
  targetAvatar: z.string().min(5),
  revenueModel: z.string(),
  estimatedMonthlyRevenueAt100: z.number().min(0),
  difficulty: z.number().min(1).max(10),
  daysToFirstEuro: z.number().min(1).max(90),
  uniqueInsight: z.string().min(10),
  whyNow: z.string().min(5),
  attractivenessScore: z.number().min(1).max(100),
});

export const OpportunitySynthesizerOutputSchema = z
  .array(OpportunitySchema)
  .min(3)
  .max(7)
  .describe('3-7 ranked opportunities, sorted by attractivenessScore descending');

export type TrendScoutOutput = z.infer<typeof TrendScoutOutputSchema>;
export type Opportunity = z.infer<typeof OpportunitySchema>;

export interface Genome {
  id: string;
  role: AgentRole;
  systemPrompt: string;
  temperature: number;
  fewShots?: string[];
  fitness: number;
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
