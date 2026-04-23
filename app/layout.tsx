import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider, NO_FOUC_SCRIPT } from '@/lib/theme/ThemeProvider'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'EIPP — Event Intelligence & Portfolio Platform',
  description:
    'Abu Dhabi Events Bureau. Director-level calendar intelligence, gap detection, and portfolio optimization for signature events across the Emirate.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Set the theme attribute before paint to prevent FOUC */}
        <script dangerouslySetInnerHTML={{ __html: NO_FOUC_SCRIPT }} />
      </head>
      <body className="bg-surface-canvas text-fg-primary antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
