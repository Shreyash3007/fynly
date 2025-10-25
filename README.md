# 🚀 Fynly - Financial Advisor Marketplace

> **Connect investors with verified SEBI-registered financial advisors for 1-on-1 paid consultations**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.1-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Overview

**Fynly** is a fintech marketplace platform that bridges the gap between investors seeking financial guidance and SEBI-registered advisors. Think of it as "UrbanClap for Financial Advisors" or "Groww Meet Advisors."

### Core Problem Solved
- 🔍 **For Investors:** Finding trusted, verified financial advisors is difficult
- 📊 **For Advisors:** Lack of discovery, scheduling, and reputation-building tools
- 🤝 **Solution:** Seamless discovery → booking → payment → video call → feedback flow

### User Roles
1. **Investor (Client)** - Search advisors, book consultations, pay, review
2. **Advisor (Expert)** - Apply for verification, receive bookings, conduct calls, earn
3. **Admin (Fynly Team)** - Approve advisors, manage disputes, monitor compliance

---

## ✨ Features

### 🔐 Authentication & Authorization
- Email/password and Google OAuth sign-in
- Role-based access control (Investor, Advisor, Admin)
- Secure session management with Supabase Auth

### 👔 Advisor Features
- **Onboarding:** SEBI certificate upload, LinkedIn verification, expertise selection
- **Profile:** Bio, hourly rate, experience, photo, rating display
- **Dashboard:** Bookings, earnings, reviews, analytics
- **Status Management:** Pending → Approved → Active (or Rejected)

### 🔍 Investor Features
- **Discovery:** Search and filter advisors by expertise, rating, price
- **Booking:** Select time slots and instant video room creation
- **Payment:** Razorpay integration with secure checkout
- **Reviews:** Rate and review completed consultations
- **Dashboard:** Upcoming calls, transaction history, recommendations

### 🎥 Video Consultation
- Daily.co integration for 1-on-1 video calls
- Ephemeral meeting links (24-hour expiration)
- Pre-join UI and screenshare enabled
- Explicit consent for recording (GDPR compliant)

### 💳 Payment Processing
- Razorpay checkout with signature verification
- 90% payout to advisor, 10% platform commission
- Webhook idempotency for payment confirmation
- Refund management via admin panel

### 📊 Admin Panel
- Advisor approval workflow with rejection reasons
- Transaction monitoring and dispute resolution
- Compliance dashboard with audit logs
- Analytics: Top earners, advisor performance, revenue tracking

### 🔔 Notifications
- Email confirmations for bookings (Resend integration)
- Advisor approval/rejection notifications
- Review reminders after consultation

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **State:** Zustand (optional)
- **UI Components:** Custom components with Tailwind

### Backend
- **Database:** PostgreSQL (via Supabase)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **API:** Next.js API Routes + Supabase Edge Functions

### Integrations
- **Video:** Daily.co API
- **Payments:** Razorpay SDK
- **Email:** Resend
- **Analytics:** Supabase Events

### DevOps
- **Hosting:** Firebase Hosting
- **CI/CD:** GitHub Actions
- **Testing:** Jest + Cypress
- **Linting:** ESLint + Prettier

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git** installed
- **Supabase** account ([supabase.com](https://supabase.com))
- **Daily.co** API key ([daily.co](https://daily.co))
- **Razorpay** account ([razorpay.com](https://razorpay.com))
- **Resend** API key ([resend.com](https://resend.com))
- **Firebase** project ([firebase.google.com](https://firebase.google.com))

---

## 🚀 Installation

### Windows (Command Prompt)

```cmd
# Clone the repository
git clone https://github.com/your-org/fynly.git
cd fynly

# Run automated setup script
scripts\setup.bat
```

### Windows (PowerShell)

```powershell
# Clone the repository
git clone https://github.com/your-org/fynly.git
cd fynly

# Run automated setup script
.\scripts\setup.ps1
```

### Manual Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Install global tools (optional)
npm install -g supabase firebase-tools
```

---

## ⚙️ Configuration

### 1. Environment Variables

Edit `.env.local` with your credentials:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Fynly

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Daily.co Video
NEXT_PUBLIC_DAILY_API_KEY=your_daily_api_key
DAILY_API_KEY=your_daily_api_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key

# Resend Email
RESEND_API_KEY=re_xxxxx
NEXT_PUBLIC_EMAIL_FROM=noreply@fynly.com

# Firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project

# Security
ENCRYPTION_KEY=your_32_character_random_string

# Commission
FYNLY_COMMISSION_PERCENT=10
```

### 2. API Keys Setup Guide

#### Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Go to **Settings → API**
3. Copy `URL` and `anon public` key
4. Copy `service_role` key (keep secure!)

#### Daily.co
1. Sign up at [daily.co](https://daily.co)
2. Go to **Developers → API Keys**
3. Create new API key

#### Razorpay
1. Sign up at [razorpay.com](https://razorpay.com)
2. Use **Test Mode** for development
3. Go to **Settings → API Keys**
4. Generate Test Key ID and Secret

#### Resend
1. Sign up at [resend.com](https://resend.com)
2. Add and verify your domain
3. Create API key in dashboard

---

## 🗄️ Database Setup

### Option 1: Local Development (Supabase CLI)

```bash
# Start local Supabase
supabase start

# Run migrations
supabase db reset

# Seed test data (optional)
supabase db seed
```

### Option 2: Remote Database

```bash
# Link to remote project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Seed data
psql -h db.xxxxx.supabase.co -p 5432 -d postgres -U postgres -f scripts/db-seed.sql
```

### Manual Migration

If Supabase CLI is not available:

1. Open Supabase Dashboard → **SQL Editor**
2. Run migrations in order:
   - `supabase/migrations/20240101000001_init_schema.sql`
   - `supabase/migrations/20240101000002_rls_policies.sql`
   - `supabase/migrations/20240101000003_auth_triggers.sql`

---

## 💻 Development

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Open Cypress E2E tests
npm run format       # Format code with Prettier
```

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes & Test**
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```

3. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

4. **Create Pull Request**
   - GitHub will run CI/CD checks automatically
   - Wait for approval before merging

---

## 🧪 Testing

### Unit Tests (Jest)

```bash
# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- tests/unit/lib/auth.test.ts

# Watch mode
npm run test:watch
```

### E2E Tests (Cypress)

```bash
# Open Cypress UI
npm run test:e2e

# Run headless
npm run test:e2e:headless
```

### Test Coverage Goals

- **Minimum:** 80% coverage (enforced in CI/CD)
- **Focus areas:** Auth, payments, video sessions, bookings

---

## 🚢 Deployment

### Firebase Hosting (Automated)

```bash
# Windows Command Prompt
scripts\deploy.bat

# PowerShell
.\scripts\deploy.ps1

# Manual
firebase login
npm run build
firebase deploy --only hosting
```

### Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured in Firebase
- [ ] Database migrations applied
- [ ] API keys are production keys (not test)
- [ ] Razorpay in live mode
- [ ] Firebase project linked

### CI/CD Pipeline

GitHub Actions automatically:
1. ✅ Runs linting and type checks
2. ✅ Executes unit tests
3. ✅ Runs E2E tests
4. ✅ Builds production bundle
5. ✅ Deploys to Firebase on `main` branch push

### Environment Variables in GitHub

Add secrets in **Settings → Secrets and variables → Actions**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_DAILY_API_KEY`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `FIREBASE_SERVICE_ACCOUNT`
- `FIREBASE_PROJECT_ID`

---

## 📁 Project Structure

```
Fynly/
├── .github/
│   └── workflows/          # CI/CD pipelines
├── public/                 # Static assets
├── scripts/                # Setup & deployment scripts
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # Auth pages (login, signup)
│   │   ├── (investor)/     # Investor dashboard & pages
│   │   ├── (advisor)/      # Advisor dashboard & pages
│   │   ├── (admin)/        # Admin panel
│   │   ├── api/            # API routes
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Homepage
│   ├── components/         # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── auth/           # Auth-related components
│   │   ├── advisor/        # Advisor components
│   │   └── booking/        # Booking components
│   ├── lib/                # Core utilities
│   │   ├── supabase/       # Supabase clients
│   │   ├── razorpay/       # Payment integration
│   │   ├── daily/          # Video API
│   │   ├── email/          # Email service
│   │   └── auth/           # Auth actions
│   ├── hooks/              # Custom React hooks
│   ├── store/              # State management
│   ├── types/              # TypeScript types
│   └── styles/             # Global styles
├── supabase/
│   └── migrations/         # Database migrations
├── tests/
│   ├── unit/               # Unit tests
│   └── e2e/                # E2E tests
├── .env.local.example      # Environment template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── tailwind.config.ts      # Tailwind config
└── README.md               # This file
```

---

## 🔌 API Integration

### Razorpay Payment Flow

```typescript
// 1. Create order on backend
const order = await createRazorpayOrder({
  amount: 150000, // ₹1500 in paise
  currency: 'INR',
  receipt: booking.id,
})

// 2. Open checkout on frontend
const options = getRazorpayCheckoutOptions({
  orderId: order.id,
  amount: order.amount,
  email: user.email,
  onSuccess: (response) => {
    // Verify signature on backend
    verifyPaymentSignature(
      response.razorpay_order_id,
      response.razorpay_payment_id,
      response.razorpay_signature
    )
  },
})
```

### Daily.co Video Session

```typescript
// 1. Create room
const room = await createDailyRoom({
  name: generateRoomName(bookingId),
  privacy: 'private',
  properties: {
    exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    max_participants: 2,
  },
})

// 2. Generate tokens
const investorToken = await createMeetingToken({
  roomName: room.name,
  userName: investor.full_name,
  userId: investor.id,
})

// 3. Join meeting
window.open(getRoomUrl(room) + '?t=' + investorToken)
```

### Supabase RLS Example

```sql
-- Investors can only view their own bookings
CREATE POLICY "Investors view own bookings"
  ON bookings FOR SELECT
  USING (investor_id = auth.uid());

-- Advisors can view bookings assigned to them
CREATE POLICY "Advisors view assigned bookings"
  ON bookings FOR SELECT
  USING (
    advisor_id = (
      SELECT id FROM advisors WHERE user_id = auth.uid()
    )
  );
```

---

## 🔒 Security

### Best Practices Implemented

✅ **Authentication**
- Supabase Auth with JWT tokens
- Google OAuth integration
- Secure password hashing (bcrypt)

✅ **Authorization**
- Row-Level Security (RLS) on all tables
- Role-based access control
- Admin-only endpoints

✅ **Data Protection**
- HTTPS enforced
- Environment variables for secrets
- Encryption for sensitive data

✅ **Payment Security**
- Razorpay signature verification
- Idempotency keys for webhooks
- PCI DSS compliance via Razorpay

✅ **Privacy**
- GDPR-compliant consent tracking
- PII masking in logs
- Data retention policies

### OWASP Top 10 Mitigations

1. **Injection:** Parameterized queries via Supabase
2. **Authentication:** Supabase Auth + MFA support
3. **Sensitive Data:** Encrypted storage, secure env vars
4. **XXE:** Not applicable (no XML parsing)
5. **Broken Access Control:** RLS policies enforced
6. **Security Misconfiguration:** Security headers in Next.js
7. **XSS:** React auto-escaping + CSP headers
8. **Deserialization:** Input validation with Zod
9. **Components:** Automated dependency scanning
10. **Logging:** Structured logging + audit trails

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Supabase connection failed"
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection
curl https://your-project.supabase.co/rest/v1/
```

#### 2. "Razorpay checkout not opening"
- Ensure `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set
- Check browser console for errors
- Verify Razorpay script loaded: `window.Razorpay`

#### 3. "Daily.co room creation failed"
- Verify API key in `.env.local`
- Check API quota limits
- Ensure room names are unique

#### 4. "Database migrations not applying"
```bash
# Reset local database
supabase db reset

# Check migration status
supabase migration list
```

#### 5. "Build fails in production"
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Debug Mode

Enable verbose logging:

```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Process

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards

- **TypeScript:** Strict mode, no `any`
- **Linting:** ESLint + Prettier
- **Testing:** 80%+ coverage required
- **Commits:** Conventional Commits format

### Commit Message Format

```
feat: add advisor rating algorithm
fix: resolve payment webhook race condition
docs: update API documentation
test: add E2E tests for booking flow
chore: update dependencies
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js** for the amazing framework
- **Supabase** for backend infrastructure
- **Razorpay** for payment processing
- **Daily.co** for video infrastructure
- **Tailwind CSS** for styling
- All contributors and supporters

---

## 📞 Support

- **Email:** support@fynly.com
- **Documentation:** [docs.fynly.com](https://docs.fynly.com)
- **Issues:** [GitHub Issues](https://github.com/your-org/fynly/issues)

---

## 🗺️ Roadmap

### Phase 1 (Current - MVP)
- ✅ Authentication & role-based access
- ✅ Advisor onboarding & approval
- ✅ Booking & payment flow
- ✅ Video consultations
- ✅ Review system

### Phase 2 (Next 3 months)
- [ ] ML-based advisor matchmaking
- [ ] Subscription plans for advisors
- [ ] In-app chat messaging
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard

### Phase 3 (Next 6 months)
- [ ] Multi-language support
- [ ] Advisor content marketplace
- [ ] Webinar hosting
- [ ] API for third-party integrations
- [ ] White-label solution

---

<div align="center">

**Built with ❤️ by the Fynly Team**

[Website](https://fynly.com) • [Documentation](https://docs.fynly.com) • [Twitter](https://twitter.com/fynly)

</div>

