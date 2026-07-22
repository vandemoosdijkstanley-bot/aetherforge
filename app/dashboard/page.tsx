export default function Dashboard() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">AetherForge Dashboard</h1>
        <p className="text-zinc-400 mb-8">
          Enter a niche and run the multi-agent pipeline. Rate the output to evolve the genomes.
        </p>

        <div className="space-y-4 border border-zinc-800 rounded-xl p-6">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Niche / Domain</label>
            <input
              type="text"
              placeholder="e.g. AI tools for indie hackers, sustainable fashion, B2B SaaS for lawyers"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Goal (optional)</label>
            <input
              type="text"
              placeholder="High-margin recurring revenue, 30-day launch"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Your LLM API Key</label>
            <input
              type="password"
              placeholder="sk-... or equivalent"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
            />
          </div>
          <button className="w-full bg-white text-black font-medium py-3 rounded-lg hover:bg-zinc-200 transition">
            Start Forging
          </button>
        </div>

        <p className="mt-6 text-sm text-zinc-500">
          The engine uses genetic prompt evolution. Your ratings improve future runs.
        </p>
      </div>
    </main>
  )
}
