/**
 * Root Layout - Neo-Finance Hybrid Design
 * Global layout with Google Fonts (Inter + Poppins)
 */

import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import '@/styles/globals.css'
import { ToastProvider } from '@/components/ui/ToastProvider'

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
  title: 'Fynly - Connect with Verified Financial Advisors',
  description:
    'Find trusted SEBI-registered financial advisors for personalized investment guidance. Book 1-on-1 consultations and grow your wealth.',
  keywords: [
    'financial advisor',
    'investment advice',
    'SEBI registered',
    'portfolio management',
    'wealth management',
  ],
  authors: [{ name: 'Fynly Team' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Fynly',
    title: 'Fynly - Connect with Verified Financial Advisors',
    description: 'Book 1-on-1 consultations with trusted financial advisors',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fynly - Connect with Verified Financial Advisors',
    description: 'Book 1-on-1 consultations with trusted financial advisors',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-smoke font-sans antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}

