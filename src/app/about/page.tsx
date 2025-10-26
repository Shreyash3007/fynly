/**
 * About Page - Neo-Finance Hybrid Design
 * Professional about page showcasing Fynly's mission and values
 */

import Link from 'next/link'
import { Navbar } from '@/components/layout'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-smoke">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-subtle pt-32 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(58,226,206,0.05),transparent_50%)]" />
        
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="mb-6 font-display text-4xl font-bold text-graphite-900 md:text-5xl lg:text-6xl">
            About <span className="text-gradient-mint">Fynly</span>
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-graphite-600 lg:text-xl">
            We're on a mission to democratize access to professional financial advice
            and empower every Indian to make informed investment decisions.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="mb-4 font-display text-3xl font-semibold text-graphite-900 lg:text-4xl">
                Our Mission
              </h2>
            </div>
            <p className="text-lg text-graphite-700 leading-relaxed mb-6">
              Fynly was founded with a simple belief: everyone deserves access to quality financial advice,
              not just the wealthy. We connect verified SEBI-registered advisors with investors seeking
              personalized guidance, creating a trusted marketplace that benefits both parties.
            </p>
            <p className="text-lg text-graphite-700 leading-relaxed">
              Our platform leverages technology to make financial advisory services more accessible,
              transparent, and affordable. We verify every advisor, maintain complete transparency in
              pricing, and ensure secure payments through industry-leading payment gateways.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="mb-4 font-display text-3xl font-semibold text-graphite-900 lg:text-4xl">
              Our Values
            </h2>
            <p className="text-graphite-600 max-w-2xl mx-auto">
              These principles guide everything we do
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <div className="rounded-2xl bg-white/60 backdrop-blur-lg border border-graphite-100/50 p-8 shadow-neomorph">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-mint-50 text-mint-600 mb-6">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold text-graphite-900 mb-3">
                Trust & Transparency
              </h3>
              <p className="text-graphite-600 leading-relaxed">
                We verify every advisor and maintain complete transparency in pricing, qualifications, and reviews.
              </p>
            </div>

            <div className="rounded-2xl bg-white/60 backdrop-blur-lg border border-graphite-100/50 p-8 shadow-neomorph">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-mint-50 text-mint-600 mb-6">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold text-graphite-900 mb-3">
                Accessibility
              </h3>
              <p className="text-graphite-600 leading-relaxed">
                Professional financial advice should be available to everyone, not just the privileged few.
              </p>
            </div>

            <div className="rounded-2xl bg-white/60 backdrop-blur-lg border border-graphite-100/50 p-8 shadow-neomorph">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-mint-50 text-mint-600 mb-6">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold text-graphite-900 mb-3">
                Innovation
              </h3>
              <p className="text-graphite-600 leading-relaxed">
                We leverage technology to make financial advisory services more efficient and user-friendly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="mb-4 font-display text-3xl font-semibold text-graphite-900 lg:text-4xl">
              Fynly by the Numbers
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-4 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-5xl font-display font-bold text-graphite-900 mb-2">500+</div>
              <div className="text-graphite-600">SEBI Verified Advisors</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-display font-bold text-graphite-900 mb-2">10K+</div>
              <div className="text-graphite-600">Happy Investors</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-display font-bold text-graphite-900 mb-2">4.8★</div>
              <div className="text-graphite-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-display font-bold text-graphite-900 mb-2">₹500Cr+</div>
              <div className="text-graphite-600">Assets Under Advisory</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 font-display text-3xl font-semibold text-graphite-900">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="mb-8 text-lg text-graphite-600 max-w-xl mx-auto">
            Join thousands of investors who found the right financial guidance on Fynly
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

