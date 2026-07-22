export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold mb-4 tracking-tight">AetherForge</h1>
      <p className="text-xl text-zinc-400 max-w-2xl text-center mb-8">
        The autonomous multi-agent engine that invents revenue opportunities and forges complete go-to-market assets.
      </p>
      <div className="flex gap-4">
        <a href="/dashboard" className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition">
          Start Forging
        </a>
        <a href="#how" className="px-6 py-3 border border-zinc-700 rounded-lg font-medium hover:bg-zinc-900 transition">
          How it works
        </a>
      </div>
      <section id="how" className="mt-24 max-w-3xl space-y-6 text-zinc-300">
        <h2 className="text-2xl font-semibold text-white">How it works</h2>
        <ol className="list-decimal list-inside space-y-3">
          <li>Input your niche or goal</li>
          <li>Agents research trends, synthesize opportunities, and score them</li>
          <li>AssetForger generates landing page code, copy, and marketing assets</li>
          <li>Rate the output — the EvolutionEngine improves future runs</li>
        </ol>
      </section>
    </main>
  );
}
