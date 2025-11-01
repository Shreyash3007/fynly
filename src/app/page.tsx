/**
 * Landing Page - Enhanced Fintech UI
 * Modern fintech homepage with glassmorphism and mint accents
 */

import Link from 'next/link'
import { Navbar } from '@/components/layout'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navbar />

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-graphite-900 via-graphite-800 to-graphite-900 pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-mint-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-mint-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="mb-6 font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Your financial future,
            <br />
            <span className="text-gradient-mint">one conversation away.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-mint-100 lg:text-xl">
            Connect with SEBI-verified advisors for personalized guidance. 
            Book your free demo in 2 minutes.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center px-8 py-4 bg-white text-graphite-900 font-semibold rounded-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-200"
            >
              Find Your Advisor
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/signup?role=advisor"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              Become an Advisor
            </Link>
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
              <svg className="w-5 h-5 text-mint-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-mint-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>4.8 Average Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-smoke">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center font-display text-3xl font-semibold text-graphite-900 lg:text-4xl">
            Why Choose Fynly?
          </h2>
          <p className="mb-12 text-center text-graphite-600 max-w-2xl mx-auto">
            Finance reimagined for Gen Z professionals
          </p>
          
          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-2xl bg-white/90 backdrop-blur-md border border-white/50 p-8 shadow-neomorph-lg hover:shadow-neomorph-xl hover:border-mint-300 transition-all duration-300 hover:-translate-y-1">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-mint-400 to-mint-600 text-white shadow-lg">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="mb-3 font-display text-xl font-semibold text-graphite-900">Verified Advisors</h3>
              <p className="text-graphite-600 leading-relaxed">
                All advisors are SEBI-registered and manually verified by our team. Trust through transparency.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl bg-white/90 backdrop-blur-md border border-white/50 p-8 shadow-neomorph-lg hover:shadow-neomorph-xl hover:border-mint-300 transition-all duration-300 hover:-translate-y-1">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-white shadow-lg">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
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
            <div className="group rounded-2xl bg-white/90 backdrop-blur-md border border-white/50 p-8 shadow-neomorph-lg hover:shadow-neomorph-xl hover:border-mint-300 transition-all duration-300 hover:-translate-y-1">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
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

      {/* New: Investment Solutions Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="mb-4 font-display text-3xl font-semibold text-graphite-900 lg:text-4xl">
              Investment Solutions for Every Goal
            </h2>
            <p className="text-graphite-600 max-w-2xl mx-auto">
              From retirement planning to wealth creation, our advisors specialize in diverse investment strategies
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {/* Solution 1 */}
            <div className="bg-smoke/50 rounded-2xl p-6 shadow-neomorph-lg hover:shadow-neomorph-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-graphite-900 mb-2">
                Retirement Planning
              </h3>
              <p className="text-sm text-graphite-600 leading-relaxed">
                Build a secure retirement fund with expert guidance on pension plans, EPF, and NPS.
              </p>
            </div>

            {/* Solution 2 */}
            <div className="bg-smoke/50 rounded-2xl p-6 shadow-neomorph-lg hover:shadow-neomorph-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-graphite-900 mb-2">
                Wealth Creation
              </h3>
              <p className="text-sm text-graphite-600 leading-relaxed">
                Grow your wealth through strategic investments in mutual funds, stocks, and real estate.
              </p>
            </div>

            {/* Solution 3 */}
            <div className="bg-smoke/50 rounded-2xl p-6 shadow-neomorph-lg hover:shadow-neomorph-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-graphite-900 mb-2">
                Tax Planning
              </h3>
              <p className="text-sm text-graphite-600 leading-relaxed">
                Optimize your tax liability with smart investment strategies and tax-saving instruments.
              </p>
            </div>

            {/* Solution 4 */}
            <div className="bg-smoke/50 rounded-2xl p-6 shadow-neomorph-lg hover:shadow-neomorph-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-graphite-900 mb-2">
                Insurance Planning
              </h3>
              <p className="text-sm text-graphite-600 leading-relaxed">
                Protect your family's future with comprehensive life and health insurance strategies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* New: Pricing Section */}
      <section className="py-20 bg-smoke">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="mb-4 font-display text-3xl font-semibold text-graphite-900 lg:text-4xl">
              Transparent Pricing
            </h2>
            <p className="text-graphite-600 max-w-2xl mx-auto">
              No hidden fees, no surprises. Pay only for the value you receive.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Free Demo */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-neomorph-lg hover:shadow-neomorph-xl transition-all duration-300 border-2 border-mint-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-mint-400 to-mint-600 text-white mb-6 shadow-lg">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-display text-2xl font-semibold text-graphite-900 mb-2">
                  Free Demo
                </h3>
                <div className="text-4xl font-bold text-mint-600 mb-4">
                  ₹0
                </div>
                <p className="text-graphite-600 mb-6">
                  Get started with a complimentary 10-minute consultation
                </p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-mint-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-graphite-600">10-minute consultation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-mint-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-graphite-600">Basic financial assessment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-mint-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-graphite-600">No commitment required</span>
                  </li>
                </ul>
                <Link
                  href="/advisors"
                  className="block w-full px-6 py-3 bg-gradient-mint text-white font-semibold rounded-lg shadow-glow-mint hover:shadow-glow-mint-lg transition-all duration-200"
                >
                  Start Free Demo
                </Link>
              </div>
            </div>

            {/* Standard Consultation */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-neomorph-lg hover:shadow-neomorph-xl transition-all duration-300 border-2 border-cyan-200 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-white mb-6 shadow-lg">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-display text-2xl font-semibold text-graphite-900 mb-2">
                  Standard Consultation
                </h3>
                <div className="text-4xl font-bold text-cyan-600 mb-4">
                  ₹999
                </div>
                <p className="text-graphite-600 mb-6">
                  Comprehensive 60-minute financial planning session
                </p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-graphite-600">60-minute detailed consultation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-graphite-600">Personalized investment plan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-graphite-600">Follow-up support for 7 days</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-graphite-600">Written recommendations</span>
                  </li>
                </ul>
                <Link
                  href="/advisors"
                  className="block w-full px-6 py-3 bg-gradient-to-r from-cyan-400 to-cyan-600 text-white font-semibold rounded-lg shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all duration-200"
                >
                  Book Consultation
                </Link>
              </div>
            </div>

            {/* Premium Package */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-neomorph-lg hover:shadow-neomorph-xl transition-all duration-300 border-2 border-purple-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 text-white mb-6 shadow-lg">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="font-display text-2xl font-semibold text-graphite-900 mb-2">
                  Premium Package
                </h3>
                <div className="text-4xl font-bold text-purple-600 mb-4">
                  ₹2,999
                </div>
                <p className="text-graphite-600 mb-6">
                  Complete financial planning with ongoing support
                </p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-graphite-600">90-minute comprehensive session</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-graphite-600">Complete financial roadmap</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-graphite-600">30-day follow-up support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-graphite-600">Portfolio review & rebalancing</span>
                  </li>
                </ul>
                <Link
                  href="/advisors"
                  className="block w-full px-6 py-3 bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold rounded-lg shadow-glow-purple hover:shadow-glow-purple-lg transition-all duration-200"
                >
                  Get Premium Plan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="mb-4 font-display text-3xl font-semibold text-graphite-900 lg:text-4xl">
              How Fynly Works
            </h2>
            <p className="text-graphite-600 max-w-2xl mx-auto">
              Get expert financial guidance in three simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-mint-400 to-mint-600 text-white font-display font-bold text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
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
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-white font-display font-bold text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
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
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 text-white font-display font-bold text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
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
      <section className="py-20 bg-gradient-to-br from-graphite-900 via-graphite-800 to-graphite-900">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4 max-w-5xl mx-auto text-center">
            <div className="group">
              <div className="text-5xl font-display font-bold text-white mb-2 group-hover:scale-110 transition-transform">500+</div>
              <div className="text-mint-200">Verified Advisors</div>
            </div>
            <div className="group">
              <div className="text-5xl font-display font-bold text-white mb-2 group-hover:scale-110 transition-transform">10,000+</div>
              <div className="text-mint-200">Happy Investors</div>
            </div>
            <div className="group">
              <div className="text-5xl font-display font-bold text-white mb-2 group-hover:scale-110 transition-transform">4.8★</div>
              <div className="text-mint-200">Average Rating</div>
            </div>
            <div className="group">
              <div className="text-5xl font-display font-bold text-white mb-2 group-hover:scale-110 transition-transform">₹500Cr+</div>
              <div className="text-mint-200">Assets Managed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-20 bg-smoke">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="mb-4 font-display text-3xl font-semibold text-graphite-900 lg:text-4xl">
              What Our Users Say
            </h2>
            <p className="text-graphite-600 max-w-2xl mx-auto">
              Real stories from investors who found the right guidance
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="group rounded-2xl bg-white/90 backdrop-blur-md border border-white/50 p-6 shadow-neomorph-lg hover:shadow-neomorph-xl hover:border-mint-300 transition-all duration-300">
              <div className="flex items-center gap-1 mb-4 text-mint-500">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-graphite-700 mb-6 leading-relaxed">
                "Found an amazing advisor through Fynly. The platform made it so easy to compare options and book a consultation. My portfolio has grown 28% this year!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center text-white font-semibold shadow-lg">
                  PS
                </div>
                <div>
                  <div className="font-semibold text-graphite-900">Priya Sharma</div>
                  <div className="text-sm text-graphite-600">Software Engineer, Bangalore</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="group rounded-2xl bg-white/90 backdrop-blur-md border border-white/50 p-6 shadow-neomorph-lg hover:shadow-neomorph-xl hover:border-mint-300 transition-all duration-300">
              <div className="flex items-center gap-1 mb-4 text-mint-500">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-graphite-700 mb-6 leading-relaxed">
                "As a first-time investor, I was overwhelmed. My advisor helped me understand everything and build a solid investment strategy. Highly recommend!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-semibold shadow-lg">
                  RK
                </div>
                <div>
                  <div className="font-semibold text-graphite-900">Rahul Kumar</div>
                  <div className="text-sm text-graphite-600">Marketing Manager, Mumbai</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="group rounded-2xl bg-white/90 backdrop-blur-md border border-white/50 p-6 shadow-neomorph-lg hover:shadow-neomorph-xl hover:border-mint-300 transition-all duration-300">
              <div className="flex items-center gap-1 mb-4 text-mint-500">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-graphite-700 mb-6 leading-relaxed">
                "The verification process gave me confidence. All advisors are SEBI-registered, and the platform is transparent about fees. Finally, a service I can trust!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg">
                  AD
                </div>
                <div>
                  <div className="font-semibold text-graphite-900">Anita Desai</div>
                  <div className="text-sm text-graphite-600">Doctor, Delhi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-graphite-900 via-graphite-800 to-graphite-900 py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-mint-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-mint-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="mb-6 font-display text-3xl font-semibold text-white">Ready to Start Your Investment Journey?</h2>
          <p className="mb-8 text-lg text-mint-100 max-w-xl mx-auto">
            Join thousands of investors who found the right financial guidance on Fynly
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/advisors"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-graphite-900 font-semibold rounded-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-200"
          >
            Browse Advisors
          </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
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
