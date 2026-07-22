/**
 * AetherForge Genetic Evolution Engine
 * Evolves LLM system prompts via genetic operators so agents improve with user feedback.
 */

export interface Genome {
  id: string;
  role: 'trendScout' | 'synthesizer' | 'forger';
  systemPrompt: string;
  temperature: number;
  fewShots: string[];
  fitness: number; // running average of user ratings (1-5)
  generation: number;
  mutations: string[];
  usageCount: number;
}

const MUTATION_PHRASES = [
  "Prioritize recurring revenue and high gross margins above all else.",
  "Target underserved European or non-US markets for lower competition.",
  "Favor products that a solo founder can build and launch in a single weekend.",
  "Emphasize AI-native features that create a real defensibility moat.",
  "Focus exclusively on problems people already pay for imperfectly.",
  "Design for solo-founder distribution via X/Twitter and Product Hunt.",
  "Include clear network effects or accumulating data moats where possible.",
  "Optimize ruthlessly for first euro / first customer in under 14 days.",
  "Prefer high perceived value digital products with near-zero marginal cost.",
  "Make the value proposition so clear a stranger understands it in 3 seconds.",
  "Bias toward tools that save time or make money for the end user immediately.",
  "Add concrete numbers, pricing anchors and social proof cues in every idea.",
];

/** Create a fresh genome from a base system prompt */
export function createInitialGenome(
  role: Genome['role'],
  basePrompt: string
): Genome {
  return {
    id: crypto.randomUUID(),
    role,
    systemPrompt: basePrompt,
    temperature: 0.7,
    fewShots: [],
    fitness: 0,
    generation: 0,
    mutations: [],
    usageCount: 0,
  };
}

/** Mutate a parent genome */
export function mutateGenome(parent: Genome, intensity = 0.35): Genome {
  let newPrompt = parent.systemPrompt;
  const applied: string[] = [];

  // Phrase injection mutation
  if (Math.random() < intensity) {
    const phrase =
      MUTATION_PHRASES[Math.floor(Math.random() * MUTATION_PHRASES.length)];
    newPrompt += `\n\nAdditional high-leverage directive: ${phrase}`;
    applied.push(`+ ${phrase}`);
  }

  // Temperature jitter
  const newTemp = Math.max(
    0.15,
    Math.min(1.05, parent.temperature + (Math.random() - 0.5) * 0.25)
  );

  // Occasional few-shot addition placeholder (can be expanded with real examples later)
  const newFewShots = [...parent.fewShots];
  if (Math.random() < 0.15 && newFewShots.length < 3) {
    newFewShots.push("[future few-shot example slot]");
    applied.push("+fewshot-slot");
  }

  return {
    ...parent,
    id: crypto.randomUUID(),
    systemPrompt: newPrompt,
    temperature: Number(newTemp.toFixed(2)),
    fewShots: newFewShots,
    generation: parent.generation + 1,
    mutations: [...parent.mutations, ...applied],
    fitness: 0, // must be re-evaluated
    usageCount: 0,
  };
}

/** Crossover two parents – keep the better structure, inject diversity from the other */
export function crossover(a: Genome, b: Genome): Genome {
  const better = a.fitness >= b.fitness ? a : b;
  const other = a.fitness >= b.fitness ? b : a;

  // Split prompts roughly in half and recombine
  const mid = Math.floor(better.systemPrompt.length / 2);
  const newPrompt =
    better.systemPrompt.slice(0, mid) +
    "\n" +
    other.systemPrompt.slice(Math.floor(other.systemPrompt.length / 3));

  return {
    id: crypto.randomUUID(),
    role: better.role,
    systemPrompt: newPrompt,
    temperature: Number(((a.temperature + b.temperature) / 2).toFixed(2)),
    fewShots: [...new Set([...a.fewShots, ...b.fewShots])].slice(0, 3),
    fitness: 0,
    generation: Math.max(a.generation, b.generation) + 1,
    mutations: [
      `crossover(${a.id.slice(0, 6)}+${b.id.slice(0, 6)})`,
    ],
    usageCount: 0,
  };
}

/** Elitist population update – keep the best, inject the new candidate */
export function updatePopulation(
  population: Genome[],
  candidate: Genome,
  maxSize = 6
): Genome[] {
  const combined = [...population, candidate]
    .sort((x, y) => y.fitness - x.fitness || y.usageCount - x.usageCount);
  // Keep top maxSize, but force some diversity if fitnesses are very close
  return combined.slice(0, maxSize);
}

/** Tournament selection */
export function selectParent(population: Genome[], k = 3): Genome {
  if (population.length === 0) throw new Error("Empty population");
  let best = population[Math.floor(Math.random() * population.length)];
  for (let i = 1; i < k; i++) {
    const contender =
      population[Math.floor(Math.random() * population.length)];
    if (
      contender.fitness > best.fitness ||
      (contender.fitness === best.fitness && contender.usageCount > best.usageCount)
    ) {
      best = contender;
    }
  }
  return best;
}

/** Update fitness with a new user rating (running average) */
export function updateFitness(genome: Genome, rating: number): Genome {
  const newCount = genome.usageCount + 1;
  const newFitness =
    (genome.fitness * genome.usageCount + rating) / newCount;
  return {
    ...genome,
    fitness: Number(newFitness.toFixed(3)),
    usageCount: newCount,
  };
}

/** Generate the next generation candidate from current population */
export function evolveNext(population: Genome[]): Genome {
  if (population.length < 2) {
    // Bootstrap: just mutate the best (or only) one
    const parent = population[0] ?? createInitialGenome("synthesizer", "");
    return mutateGenome(parent, 0.5);
  }
  const parentA = selectParent(population);
  const parentB = selectParent(population);
  // 70% crossover + mutate, 30% pure mutate of elite
  if (Math.random() < 0.7) {
    const child = crossover(parentA, parentB);
    return mutateGenome(child, 0.25);
  }
  return mutateGenome(parentA, 0.4);
}
