import type { Opportunity } from './types'

export interface ScoringWeights {
  mrr: number
  ease: number
  speed: number
  llm: number
  uniqueness?: number
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  mrr: 0.30,
  ease: 0.22,
  speed: 0.18,
  llm: 0.20,
  uniqueness: 0.10,
}

export function computeHeuristicScore(
  opp: Opportunity,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): number {
  const mrrNorm = Math.min(opp.estimatedMonthlyRevenueAt100 / 5000, 1)
  const ease = (11 - Math.max(1, Math.min(10, opp.difficulty))) / 10
  const speed = Math.max(0, 1 - opp.daysToFirstEuro / 60)
  const llmNorm = Math.max(0, Math.min(100, opp.attractivenessScore)) / 100
  // Simple uniqueness proxy from insight length + keywords
  const uniq = Math.min((opp.uniqueInsight?.length || 0) / 200, 1)

  const score =
    weights.mrr * mrrNorm +
    weights.ease * ease +
    weights.speed * speed +
    weights.llm * llmNorm +
    (weights.uniqueness || 0) * uniq

  return Number((score * 100).toFixed(1))
}

export function rankOpportunities(opps: Opportunity[]): Opportunity[] {
  return [...opps].sort(
    (a, b) => computeHeuristicScore(b) - computeHeuristicScore(a)
  )
}

export function opportunityQualityBonus(opps: Opportunity[]): number {
  if (!opps.length) return 0
  const top = rankOpportunities(opps)[0]
  return (computeHeuristicScore(top) / 100) * 1.5
}
