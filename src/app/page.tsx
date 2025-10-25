/**
 * Landing Page - Neo-Finance Hybrid Design
 * Modern fintech homepage with glassmorphism and mint accents
 */

import Link from 'next/link'
import { Navbar } from '@/components/layout'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-subtle pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(58,226,206,0.05),transparent_50%)]" />
        
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="mb-6 font-display text-4xl font-bold text-graphite-900 md:text-5xl lg:text-6xl">
            Your financial future,
            <br />
            <span className="text-gradient-mint">one conversation away.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-graphite-600 lg:text-xl">
            Connect with SEBI-verified advisors for personalized guidance. 
            Book your free demo in 2 minutes.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-mint text-white font-medium rounded-lg shadow-glow-mint hover:shadow-glow-mint-lg hover:scale-102 transition-all duration-200"
            >
              Find Your Advisor
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/signup?role=advisor"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-mint-500 text-mint-700 font-medium rounded-lg hover:bg-mint-50 transition-all duration-200"
            >
              Become an Advisor
            </Link>
          </div>

          {/* Trust Signals */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-graphite-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-mint-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>SEBI Verified Advisors</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-mint-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-mint-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>4.8 Average Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center font-display text-3xl font-semibold text-graphite-900 lg:text-4xl">
            Why Choose Fynly?
          </h2>
          <p className="mb-12 text-center text-graphite-600 max-w-2xl mx-auto">
            Finance reimagined for Gen Z professionals
          </p>
          
          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-2xl bg-white/60 backdrop-blur-lg border border-graphite-100/50 p-8 shadow-neomorph hover:shadow-glow-mint-sm hover:border-mint-300 transition-all duration-300 hover:-translate-y-1">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-mint-50 text-mint-600">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="mb-3 font-display text-xl font-semibold text-graphite-900">Verified Advisors</h3>
              <p className="text-graphite-600 leading-relaxed">
                All advisors are SEBI-registered and manually verified by our team. Trust through transparency.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl bg-white/60 backdrop-blur-lg border border-graphite-100/50 p-8 shadow-neomorph hover:shadow-glow-mint-sm hover:border-mint-300 transition-all duration-300 hover:-translate-y-1">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-mint-50 text-mint-600">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
              </div>
              <h3 className="mb-3 font-display text-xl font-semibold text-graphite-900">1-on-1 Consultations</h3>
              <p className="text-graphite-600 leading-relaxed">
                Book personalized video sessions with experts tailored to your goals. Real guidance, real growth.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl bg-white/60 backdrop-blur-lg border border-graphite-100/50 p-8 shadow-neomorph hover:shadow-glow-mint-sm hover:border-mint-300 transition-all duration-300 hover:-translate-y-1">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-mint-50 text-mint-600">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="mb-3 font-display text-xl font-semibold text-graphite-900">Secure Payments</h3>
              <p className="text-graphite-600 leading-relaxed">
                Safe and transparent pricing with Razorpay integration. Your data is encrypted and protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-subtle py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(58,226,206,0.08),transparent_60%)]" />
        
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="mb-6 font-display text-3xl font-semibold text-graphite-900">Ready to Start?</h2>
          <p className="mb-8 text-lg text-graphite-600 max-w-xl mx-auto">
            Join thousands of investors finding the right financial guidance
          </p>
          <Link
            href="/advisors"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-mint text-white font-medium rounded-lg shadow-glow-mint hover:shadow-glow-mint-lg hover:scale-102 transition-all duration-200"
          >
            Browse Advisors
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-graphite-900 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="mb-4">
              <span className="text-2xl font-display font-bold text-gradient-mint">Fynly</span>
            </div>
            <p className="text-graphite-400 mb-6">
              Finance reimagined for the modern professional
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/privacy" className="text-graphite-400 hover:text-mint-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-graphite-400 hover:text-mint-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-graphite-400 hover:text-mint-400 transition-colors">
                Contact Us
              </Link>
            </div>
            <p className="mt-8 text-sm text-graphite-500">
              © {new Date().getFullYear()} Fynly. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

