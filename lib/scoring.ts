/**
 * Pure-code opportunity scoring heuristics.
 * Used both to re-rank LLM outputs and as secondary fitness signal.
 */

export interface Opportunity {
  title: string;
  pitch: string;
  targetAvatar: string;
  revenueModel: string;
  estimatedMonthlyRevenueAt100: number;
  difficulty: number; // 1-10
  daysToFirstEuro: number;
  uniqueInsight: string;
  whyNow: string;
  attractivenessScore: number; // from LLM 1-100
}

export interface ScoringWeights {
  mrr: number;
  ease: number;
  speed: number;
  llm: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  mrr: 0.35,
  ease: 0.25,
  speed: 0.20,
  llm: 0.20,
};

export function computeHeuristicScore(
  opp: Opportunity,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): number {
  // Normalize MRR: 0-1 where 1 = €5k+/mo at 100 customers
  const mrrNorm = Math.min(opp.estimatedMonthlyRevenueAt100 / 5000, 1);

  // Ease: invert difficulty
  const ease = (11 - Math.max(1, Math.min(10, opp.difficulty))) / 10;

  // Speed: 0-1, 1 = same day, 0 = 60+ days
  const speed = Math.max(0, 1 - opp.daysToFirstEuro / 60);

  const llmNorm = Math.max(0, Math.min(100, opp.attractivenessScore)) / 100;

  const score =
    weights.mrr * mrrNorm +
    weights.ease * ease +
    weights.speed * speed +
    weights.llm * llmNorm;

  return Number((score * 100).toFixed(1));
}

export function rankOpportunities(opps: Opportunity[]): Opportunity[] {
  return [...opps].sort(
    (a, b) => computeHeuristicScore(b) - computeHeuristicScore(a)
  );
}

/** Secondary fitness signal that can boost a genome */
export function opportunityQualityBonus(opps: Opportunity[]): number {
  if (!opps.length) return 0;
  const top = rankOpportunities(opps)[0];
  const score = computeHeuristicScore(top);
  // Map 0-100 → 0-1.5 bonus that can be added to user rating
  return score / 100 * 1.5;
}
