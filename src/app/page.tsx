/**
 * Landing Page - Enhanced Demo Version
 * Beautiful landing page with improved visuals, graphics, and colors
 * Sign in leads directly to demo role selection
 */

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'

export default function HomePage() {
  const router = useRouter()

  const handleGetStarted = () => {
    // Scroll to role selection section or navigate to demo
    document.getElementById('role-selection')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleBookCall = () => {
    router.push('/discover')
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navbar />

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-graphite-900 via-graphite-800 to-graphite-900 pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Animated Background with More Colors */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-mint-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="mb-6 font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl leading-tight">
            Your financial future,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-mint-400 via-cyan-400 to-purple-400 animate-gradient">
              one conversation away.
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-mint-100 lg:text-xl">
            Connect with SEBI-verified advisors for personalized guidance. 
            Experience our interactive demo and book your free consultation.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              onClick={handleGetStarted}
              variant="primary"
              size="lg"
              className="group px-8 py-4 text-lg shadow-glow-mint-lg hover:scale-105"
            >
              Start Free Demo
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
            <Button
              onClick={handleBookCall}
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg border-2 border-white text-white hover:bg-white/10"
            >
              Book a Call
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-mint-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-mint-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>SEBI Verified Advisors</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secure & Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>4.8 Average Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section id="role-selection" className="py-20 bg-gradient-to-b from-smoke to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4 font-display text-3xl font-bold text-graphite-900 lg:text-4xl">
              Choose Your Demo Experience
            </h2>
            <p className="text-graphite-600 max-w-2xl mx-auto text-lg">
              Experience Fynly from your perspective. Select your role to get started.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Investor Card */}
            <div className="group relative bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-mint-300">
              <div className="absolute -top-4 right-4 w-16 h-16 rounded-full bg-gradient-mint flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-mint mb-4 shadow-glow-mint">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-graphite-900 mb-2">Investor</h3>
                <p className="text-graphite-600 text-lg">
                  Discover advisors, book sessions, and manage your portfolio
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => router.push('/discover')}
                className="mt-4"
              >
                Continue as Investor →
              </Button>
            </div>

            {/* Advisor Card */}
            <div className="group relative bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-cyan-300">
              <div className="absolute -top-4 right-4 w-16 h-16 rounded-full bg-gradient-cyan flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-cyan mb-4 shadow-glow-cyan">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-graphite-900 mb-2">Advisor</h3>
                <p className="text-graphite-600 text-lg">
                  Manage clients, view earnings, and schedule availability
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => router.push('/advisor/dashboard')}
                className="mt-4"
              >
                Continue as Advisor →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-white via-smoke to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="mb-4 font-display text-3xl font-bold text-graphite-900 lg:text-4xl">
              Why Choose Fynly?
            </h2>
            <p className="text-graphite-600 max-w-2xl mx-auto text-lg">
              Finance reimagined for modern professionals
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-3xl bg-white/90 backdrop-blur-md border border-white/50 p-8 shadow-xl hover:shadow-2xl hover:border-mint-300 transition-all duration-300 hover:-translate-y-2">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-mint-400 to-mint-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="mb-3 font-display text-xl font-semibold text-graphite-900">Verified Advisors</h3>
              <p className="text-graphite-600 leading-relaxed">
                All advisors are SEBI-registered and manually verified by our team. Trust through transparency.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-3xl bg-white/90 backdrop-blur-md border border-white/50 p-8 shadow-xl hover:shadow-2xl hover:border-cyan-300 transition-all duration-300 hover:-translate-y-2">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
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
            <div className="group rounded-3xl bg-white/90 backdrop-blur-md border border-white/50 p-8 shadow-xl hover:shadow-2xl hover:border-purple-300 transition-all duration-300 hover:-translate-y-2">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="mb-3 font-display text-xl font-semibold text-graphite-900">Secure Payments</h3>
              <p className="text-graphite-600 leading-relaxed">
                Safe and transparent pricing with secure payment processing. Your data is encrypted and protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-mint-50 via-cyan-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="mb-4 font-display text-3xl font-bold text-graphite-900 lg:text-4xl">
              How Fynly Works
            </h2>
            <p className="text-graphite-600 max-w-2xl mx-auto text-lg">
              Get expert financial guidance in three simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-mint-400 to-mint-600 text-white font-display font-bold text-3xl mb-6 shadow-glow-mint group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="font-display text-xl font-semibold text-graphite-900 mb-3">
                Browse Advisors
              </h3>
              <p className="text-graphite-600 leading-relaxed">
                Explore our curated list of SEBI-verified financial advisors with detailed profiles and ratings.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-white font-display font-bold text-3xl mb-6 shadow-glow-cyan group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="font-display text-xl font-semibold text-graphite-900 mb-3">
                Book Free Demo
              </h3>
              <p className="text-graphite-600 leading-relaxed">
                Schedule a complimentary consultation with your chosen advisor at a time that works for you.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-400 to-purple-600 text-white font-display font-bold text-3xl mb-6 shadow-glow-purple group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="font-display text-xl font-semibold text-graphite-900 mb-3">
                Get Guidance
              </h3>
              <p className="text-graphite-600 leading-relaxed">
                Receive personalized investment advice tailored to your financial goals and risk profile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20 bg-gradient-to-br from-graphite-900 via-graphite-800 to-graphite-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-mint-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
        </div>
        <div className="container relative mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4 max-w-5xl mx-auto text-center">
            <div className="group">
              <div className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-mint-400 to-mint-600 mb-2 group-hover:scale-110 transition-transform">50+</div>
              <div className="text-mint-200">Verified Advisors</div>
            </div>
            <div className="group">
              <div className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600 mb-2 group-hover:scale-110 transition-transform">200+</div>
              <div className="text-mint-200">Active Investors</div>
            </div>
            <div className="group">
              <div className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-2 group-hover:scale-110 transition-transform">4.8★</div>
              <div className="text-mint-200">Average Rating</div>
            </div>
            <div className="group">
              <div className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-mint-400 via-cyan-400 to-purple-400 mb-2 group-hover:scale-110 transition-transform">100%</div>
              <div className="text-mint-200">Secure</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-graphite-900 via-graphite-800 to-graphite-900 py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-mint-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="mb-6 font-display text-3xl font-bold text-white lg:text-4xl">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="mb-8 text-lg text-mint-100 max-w-xl mx-auto">
            Join hundreds of investors who found the right financial guidance on Fynly
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGetStarted}
              variant="primary"
              size="lg"
              className="px-8 py-4 text-lg shadow-glow-mint-lg"
            >
              Start Free Demo
            </Button>
            <Button
              onClick={handleBookCall}
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg border-2 border-white text-white"
            >
              Book a Call
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-graphite-900 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-mint flex items-center justify-center shadow-lg">
                <span className="text-white font-display font-bold text-xl">F</span>
              </div>
              <span className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-mint-400 to-cyan-400">Fynly</span>
            </div>
            <p className="text-graphite-400 mb-6 text-lg">
              Finance reimagined for the modern professional
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm mb-8">
              <Link href="/discover" className="text-graphite-400 hover:text-mint-400 transition-colors">
                Browse Advisors
              </Link>
              <Link href="/#features" className="text-graphite-400 hover:text-cyan-400 transition-colors">
                Features
              </Link>
              <Link href="/#how-it-works" className="text-graphite-400 hover:text-purple-400 transition-colors">
                How It Works
              </Link>
            </div>
            <p className="mt-8 text-sm text-graphite-500">
              © {new Date().getFullYear()} Fynly Demo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
