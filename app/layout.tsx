import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AetherForge – Autonomous Revenue Opportunity Engine',
  description: 'Multi-agent AI that invents revenue opportunities and forges complete go-to-market assets with self-evolving intelligence.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white antialiased">
        {children}
      </body>
    </html>
  )
}
