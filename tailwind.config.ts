import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Neo-Finance Hybrid Color System
        graphite: {
          DEFAULT: '#1F1F1F',
          50: '#F7F8FA',
          100: '#E8EAED',
          200: '#D1D5DB',
          300: '#9CA3AF',
          400: '#6B7280',
          500: '#4B5563',
          600: '#374151',
          700: '#1F2937',
          800: '#1F1F1F',
          900: '#111827',
        },
        mint: {
          DEFAULT: '#3AE2CE',
          50: '#E6F9F7',
          100: '#B8F0E8',
          200: '#8AE8DA',
          300: '#6DE8D9',
          400: '#3AE2CE',
          500: '#2DC9B7',
          600: '#25B09F',
          700: '#009FB7',
          800: '#00798C',
          900: '#006B7D',
        },
        // Backgrounds & Surfaces
        smoke: '#F7F8FA',
        'glass-white': 'rgba(255, 255, 255, 0.8)',
        'glass-dark': 'rgba(31, 31, 31, 0.8)',
        // Semantic colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      backgroundImage: {
        'gradient-mint': 'linear-gradient(135deg, #3AE2CE 0%, #009FB7 100%)',
        'gradient-mint-soft': 'linear-gradient(135deg, #E6F9F7 0%, #B8F0E8 100%)',
        'gradient-subtle': 'linear-gradient(180deg, #F7F8FA 0%, #FFFFFF 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1F1F1F 0%, #111827 100%)',
        'gradient-shimmer': 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['28px', { lineHeight: '36px' }],
        '4xl': ['32px', { lineHeight: '40px' }],
        '5xl': ['40px', { lineHeight: '48px' }],
      },
      boxShadow: {
        // Neumorphic shadows
        'neomorph': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'neomorph-sm': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'neomorph-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'neomorph-xl': '0 12px 32px rgba(0, 0, 0, 0.15)',
        // Mint glow shadows
        'glow-mint': '0 8px 20px rgba(58, 226, 206, 0.3)',
        'glow-mint-sm': '0 4px 12px rgba(58, 226, 206, 0.2)',
        'glow-mint-lg': '0 12px 28px rgba(58, 226, 206, 0.4)',
        // Inner shadows
        'inner-soft': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
        'inner-mint': 'inset 0 0 0 1px rgba(58, 226, 206, 0.1)',
        // Legacy support
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      backdropBlur: {
        xs: '2px',
      },
      scale: {
        '102': '1.02',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(58, 226, 206, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(58, 226, 206, 0.6)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config

