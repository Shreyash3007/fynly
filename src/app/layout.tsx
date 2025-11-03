/**
 * Root Layout - Fynly Demo
 * Global layout with fonts and providers
 */

import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { DemoProvider } from '@/components/providers/DemoProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Fynly Demo - Discover Financial Advisors',
  description:
    'Interactive demo showcasing Fynly: Discover, book, and connect with verified financial advisors.',
  keywords: ['financial advisor', 'investment', 'demo', 'fynly'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-smoke font-sans antialiased">
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  )
}

