import { z } from 'zod';

export type AgentRole = 'trendScout' | 'opportunitySynthesizer' | 'assetForger';

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

export type Opportunity = z.infer<typeof OpportunitySchema>;

export interface AssetPackage {
  productName: string;
  taglines: string[];
  landingPageCode: string;
  twitterPosts: string[];
  emailSequence: string[];
  pricingRecommendation: string;
  nextSteps: string[];
}
