'use client';

import { useState } from 'react';

export default function DashboardPage() {
  const [niche, setNiche] = useState('');
  const [goal, setGoal] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  async function runPipeline() {
    if (!niche.trim() || !apiKey.trim()) {
      setError('Niche and API key are required');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: niche.trim(),
          goal: goal.trim() || undefined,
          userApiKey: apiKey.trim(),
          provider: 'openai',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Pipeline failed');
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">AetherForge</h1>
        <p className="text-zinc-400 mb-8">
          Enter a niche. The multi-agent engine will generate trends, ranked opportunities and a full launch package.
        </p>

        <div className="space-y-4 border border-zinc-800 rounded-xl p-6 mb-8">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Niche</label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. AI tools for freelancers"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Goal (optional)</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="High-ROI digital products under 30 days"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Your API Key (OpenAI / xAI)</label>
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
            {loading ? 'Forging...' : 'Start Forging'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/50 border border-red-800 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-3">Top Opportunity</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-lg font-medium mb-2">{result.topOpportunity?.title}</h3>
                <p className="text-zinc-300 mb-3">{result.topOpportunity?.pitch}</p>
                <div className="grid grid-cols-2 gap-3 text-sm text-zinc-400">
                  <div>Score: {result.topOpportunity?.attractivenessScore}</div>
                  <div>Days to first €: {result.topOpportunity?.daysToFirstEuro}</div>
                  <div>Difficulty: {result.topOpportunity?.difficulty}/10</div>
                  <div>Model: {result.topOpportunity?.revenueModel}</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Assets Package</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <pre className="whitespace-pre-wrap text-sm text-zinc-300 overflow-auto max-h-[600px]">
                  {result.assetsMarkdown}
                </pre>
              </div>
            </section>

            {result.trends && (
              <section>
                <h2 className="text-xl font-semibold mb-3">Trend Intelligence</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-sm text-zinc-400">
                  <p className="mb-2">{result.trends.summaryInsight}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {result.trends.trends?.slice(0, 4).map((t: any, i: number) => (
                      <li key={i}>{t.name} (momentum {t.momentumScore}/10)</li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
