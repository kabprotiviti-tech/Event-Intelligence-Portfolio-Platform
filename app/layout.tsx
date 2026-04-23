import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EIPP — Event Intelligence & Portfolio Platform',
  description: 'Abu Dhabi Events Bureau — AI-powered calendar intelligence, gap detection & portfolio optimization.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
