/**
 * AetherForge Genetic Engine
 * Evolutionary computation applied to LLM system prompts.
 * This is the recursive self-improvement core.
 */

export type AgentRole = 'trendScout' | 'opportunitySynthesizer' | 'assetForger';

export interface Genome {
  id: string;
  role: AgentRole;
  systemPrompt: string;
  temperature: number;
  fewShots: string[];
  fitness: number;          // running average of user ratings (1-5)
  generation: number;
  mutations: string[];
  createdAt: number;
  usageCount: number;
}

/** High-leverage mutation phrases curated for revenue-focused agents */
const MUTATION_LIBRARY: Record<AgentRole, string[]> = {
  trendScout: [
    "Prioritize trends that map to high-margin digital products or SaaS with low marginal cost.",
    "Surface underserved European and non-US markets where competition is still low.",
    "Look for regulatory, platform or demographic windows that close within 6-18 months.",
    "Favor signals that already have people paying for imperfect solutions.",
    "Emphasize timing advantages: new APIs, algorithm shifts, cultural moments.",
  ],
  opportunitySynthesizer: [
    "Ruthlessly filter for ideas a solo founder can ship and charge for in under 21 days.",
    "Prefer recurring revenue models (subscription or usage) over pure one-time sales.",
    "Optimize every idea for first euro speed and high gross margin.",
    "Target avatars that already have budget and are actively searching for solutions.",
    "Add a clear data or network-effect moat wherever possible.",
  ],
  assetForger: [
    "Write conversion-first copy. Every section must reduce friction to the primary CTA.",
    "Make the generated landing page feel premium and modern — no generic templates.",
    "Include realistic, specific benefit claims grounded in the opportunity.",
    "Produce Stripe-ready code with clear comments for the user to insert their keys.",
    "Optimize the email sequence and X posts for high open/engagement rates.",
  ],
};

/** Create the initial genome from a base prompt */
export function createInitialGenome(role: AgentRole, basePrompt: string): Genome {
  return {
    id: crypto.randomUUID(),
    role,
    systemPrompt: basePrompt,
    temperature: 0.65,
    fewShots: [],
    fitness: 0,
    generation: 0,
    mutations: [],
    createdAt: Date.now(),
    usageCount: 0,
  };
}

/**
 * Mutation operator.
 * Adaptive intensity: higher when population fitness variance is low (stagnation).
 */
export function mutateGenome(
  parent: Genome,
  intensity = 0.35,
  forcePhrase?: string
): Genome {
  let newPrompt = parent.systemPrompt;
  const applied: string[] = [];

  const library = MUTATION_LIBRARY[parent.role] || MUTATION_LIBRARY.opportunitySynthesizer;

  if (forcePhrase || Math.random() < intensity) {
    const phrase = forcePhrase || library[Math.floor(Math.random() * library.length)];
    // Append as an additional directive so the original intent is preserved
    newPrompt = `${newPrompt.trim()}\n\nAdditional evolutionary directive: ${phrase}`;
    applied.push(phrase);
  }

  // Small temperature drift
  const tempDelta = (Math.random() - 0.5) * 0.25;
  const newTemp = Math.max(0.15, Math.min(1.1, parent.temperature + tempDelta));

  // Occasionally evolve few-shots (placeholder for future expansion)
  const newFewShots = [...parent.fewShots];

  return {
    ...parent,
    id: crypto.randomUUID(),
    systemPrompt: newPrompt,
    temperature: Number(newTemp.toFixed(2)),
    fewShots: newFewShots,
    generation: parent.generation + 1,
    mutations: [...parent.mutations, ...applied],
    fitness: 0, // must be re-evaluated
    createdAt: Date.now(),
    usageCount: 0,
  };
}

/**
 * Crossover: semantic-ish segment swap.
 * We split on double newlines (paragraph / instruction boundaries)
 * and recombine high-fitness parents.
 */
export function crossover(a: Genome, b: Genome): Genome {
  const better = a.fitness >= b.fitness ? a : b;
  const other = a.fitness >= b.fitness ? b : a;

  const partsA = better.systemPrompt.split(/\n\n+/);
  const partsB = other.systemPrompt.split(/\n\n+/);

  // Take first ~60% from better, rest from other
  const cut = Math.max(1, Math.floor(partsA.length * 0.6));
  const newParts = [...partsA.slice(0, cut), ...partsB.slice(cut)];
  const newPrompt = newParts.join('\n\n');

  return {
    id: crypto.randomUUID(),
    role: better.role,
    systemPrompt: newPrompt,
    temperature: Number(((a.temperature + b.temperature) / 2).toFixed(2)),
    fewShots: Array.from(new Set([...a.fewShots, ...b.fewShots])).slice(0, 4),
    fitness: 0,
    generation: Math.max(a.generation, b.generation) + 1,
    mutations: [`crossover:${a.id.slice(0, 6)}x${b.id.slice(0, 6)}`],
    createdAt: Date.now(),
    usageCount: 0,
  };
}

/** Tournament selection (size 2) */
export function selectParent(population: Genome[]): Genome {
  if (population.length === 0) throw new Error('Empty population');
  if (population.length === 1) return population[0];

  const i = Math.floor(Math.random() * population.length);
  let j = Math.floor(Math.random() * population.length);
  while (j === i) j = Math.floor(Math.random() * population.length);

  return population[i].fitness >= population[j].fitness ? population[i] : population[j];
}

/**
 * Update population with elitism + diversity pressure.
 * Always keep the current best. Replace weakest if new genome is better.
 * Soft diversity: penalize very similar prompts (simple length + first-100-char hash).
 */
export function updatePopulation(
  population: Genome[],
  candidate: Genome,
  maxSize = 6
): Genome[] {
  // Elitism: never drop the current champion
  const sorted = [...population, candidate].sort((x, y) => y.fitness - x.fitness);

  // Simple diversity filter: avoid near-duplicates
  const unique: Genome[] = [];
  const seen = new Set<string>();

  for (const g of sorted) {
    const signature = `${g.systemPrompt.length}:${g.systemPrompt.slice(0, 120)}`;
    if (!seen.has(signature)) {
      seen.add(signature);
      unique.push(g);
    }
    if (unique.length >= maxSize) break;
  }

  return unique;
}

/** Record a user rating and update fitness (exponential moving average) */
export function applyRating(genome: Genome, rating: number, alpha = 0.4): Genome {
  const r = Math.max(1, Math.min(5, rating));
  const newFitness =
    genome.usageCount === 0 ? r : genome.fitness * (1 - alpha) + r * alpha;

  return {
    ...genome,
    fitness: Number(newFitness.toFixed(3)),
    usageCount: genome.usageCount + 1,
  };
}

/** Adaptive mutation intensity based on population fitness variance */
export function adaptiveIntensity(population: Genome[]): number {
  if (population.length < 2) return 0.4;
  const mean = population.reduce((s, g) => s + g.fitness, 0) / population.length;
  const variance =
    population.reduce((s, g) => s + (g.fitness - mean) ** 2, 0) / population.length;
  // Low variance → higher mutation to escape local optima
  return variance < 0.3 ? 0.55 : variance < 0.8 ? 0.35 : 0.22;
}
