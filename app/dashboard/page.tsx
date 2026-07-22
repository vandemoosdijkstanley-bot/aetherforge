"use client"

import { useState } from 'react'

export default function DashboardPage() {
  const [niche, setNiche] = useState('')
  const [goal, setGoal] = useState('')
  const [constraints, setConstraints] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  async function runPipeline() {
    if (!niche.trim() || !apiKey.trim()) {
      setError('Niche and API key are required')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: niche.trim(),
          goal: goal.trim() || undefined,
          constraints: constraints.trim() || undefined,
          userApiKey: apiKey.trim(),
          provider: 'openai',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Pipeline failed')
      }

      setResult(data.data)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">AetherForge</h1>
        <p className="text-zinc-400 mb-8">
          Enter a niche. The multi-agent engine will generate trends, ranked opportunities and a complete launch package.
        </p>

        <div className="space-y-4 border border-zinc-800 rounded-xl p-6 mb-8">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Niche *</label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. AI tools for freelance designers"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Goal (optional)</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="High-margin digital product with fast time-to-first-euro"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Constraints (optional)</label>
            <input
              type="text"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="Solo founder, no team, max 30 days to launch"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Your LLM API Key *</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
            />
          </div>

          <button
            onClick={runPipeline}
            disabled={loading || !niche.trim() || !apiKey.trim()}
            className="w-full bg-white text-black font-medium py-3 rounded-lg hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Forging opportunities…' : 'Start Forging'}
          </button>

          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
        </div>

        {result && (
          <div className="space-y-8">
            {/* Top Opportunity */}
            <section className="border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Top Opportunity</h2>
              <div className="space-y-2 text-sm">
                <p><span className="text-zinc-400">Title:</span> {result.topOpportunity?.title}</p>
                <p><span className="text-zinc-400">Pitch:</span> {result.topOpportunity?.pitch}</p>
                <p><span className="text-zinc-400">Target:</span> {result.topOpportunity?.targetAvatar}</p>
                <p><span className="text-zinc-400">Revenue model:</span> {result.topOpportunity?.revenueModel}</p>
                <p><span className="text-zinc-400">Est. MRR @100:</span> €{result.topOpportunity?.estimatedMonthlyRevenueAt100}</p>
                <p><span className="text-zinc-400">Difficulty:</span> {result.topOpportunity?.difficulty}/10</p>
                <p><span className="text-zinc-400">Days to first euro:</span> {result.topOpportunity?.daysToFirstEuro}</p>
                <p><span className="text-zinc-400">Why now:</span> {result.topOpportunity?.whyNow}</p>
                <p><span className="text-zinc-400">Unique insight:</span> {result.topOpportunity?.uniqueInsight}</p>
              </div>
            </section>

            {/* Trends summary */}
            {result.trends && (
              <section className="border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Trend Intelligence</h2>
                <p className="text-sm text-zinc-300 mb-3">{result.trends.summaryInsight}</p>
                <ul className="space-y-2 text-sm">
                  {result.trends.trends?.slice(0, 4).map((t: any, i: number) => (
                    <li key={i} className="border-l-2 border-zinc-700 pl-3">
                      <span className="font-medium">{t.name}</span> — {t.whyNow}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Assets */}
            {result.assetsMarkdown && (
              <section className="border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Launch Package</h2>
                <pre className="text-xs bg-zinc-900 p-4 rounded-lg overflow-auto whitespace-pre-wrap max-h-[600px]">
                  {result.assetsMarkdown}
                </pre>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
