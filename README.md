# Fynly MVP v1.0

A comprehensive financial health assessment platform that calculates Personal Financial Health & Readiness (PFHR) scores, generates detailed reports, and provides personalized recommendations.

## Project Overview

Fynly MVP v1.0 is a Next.js-based application that helps users assess their financial health through a multi-step questionnaire. The platform:

- Calculates PFHR scores based on emergency funds, debt management, savings rate, investment readiness, and financial knowledge
- Generates visual score gauges and breakdowns
- Provides personalized strengths and risk recommendations
- Offers paid PDF reports via Razorpay integration
- Stores data securely in Supabase with Row Level Security (RLS)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Payments**: Razorpay
- **PDF Generation**: pdfkit
- **Testing**: Jest, React Testing Library
- **Linting**: ESLint + Prettier

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Razorpay account (for payments)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

See [Environment Variables](#environment-variables) section for details.

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL scripts in order:
   - `sql/create_tables.sql` - Creates main tables (advisors, investors, submissions)
   - `sql/add_payments_table.sql` - Creates payments table
   - `sql/add_reports_table.sql` - Creates reports table
3. Create a storage bucket named `reports` in Supabase Storage
4. Set up Row Level Security (RLS) policies (see `supabase/schema_notes.md`)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Seed Database (Optional)

Generate seed data:

```bash
npm run seed:generate
```

Follow instructions in `scripts/seed_readme.md` to import the generated data.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional (for payments)

```env
# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

See `env.example` for a complete template.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run seed:generate` - Generate seed data

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Specific Test Files

```bash
npm test -- src/__tests__/score.test.ts
npm test -- src/__tests__/api-score.test.ts
npm test -- src/__tests__/payment-flow.test.ts
```

### Test Coverage

The test suite includes:

- **Unit Tests**: Core scoring logic, utilities, schemas
  - `score.test.ts` - PFHR scoring engine
  - `razorpay-signature.test.ts` - Webhook signature verification
  - `seed-generator.test.ts` - Seed data generation

- **API Tests**: All API endpoints with mocked dependencies
  - `api-score.test.ts` - Score calculation endpoint
  - `api-report-create.test.ts` - Report order creation
  - `api-webhook-razorpay.test.ts` - Webhook handler
  - `payment-flow.test.ts` - End-to-end payment flow

- **Component Tests**: React components with React Testing Library
  - `FormStepper.test.tsx` - Multi-step form
  - `ScoreGauge.test.tsx` - Score visualization
  - `RecommendationList.test.tsx` - Strengths/risks mapping
  - `PurchaseCTA.test.tsx` - Purchase flow

- **Integration Tests**: End-to-end payment flow simulation
  - `payment-flow.test.ts` - Full payment flow with mocks

See `src/__tests__/` for all test files.

### CI/CD Testing

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

See `.github/workflows/ci.yml` for CI configuration.

## Database Setup

### 1. Run SQL Scripts

Execute these scripts in your Supabase SQL Editor in order:

1. `sql/create_tables.sql` - Main schema
2. `sql/add_payments_table.sql` - Payments table
3. `sql/add_reports_table.sql` - Reports table

### 2. Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `reports`
3. Set bucket to **Public** (or configure RLS policies for private access)

### 3. Configure Row Level Security

RLS policies are included in the SQL scripts. For production:

- Review and tighten RLS policies in `supabase/schema_notes.md`
- Ensure service role key is only used server-side
- Never expose service role key in client-side code

## Deployment

### Deploy to Vercel

1. **Connect Repository**

   - Push your code to GitHub
   - Import project in [Vercel Dashboard](https://vercel.com)
   - Connect your GitHub repository

2. **Configure Environment Variables**

   In Vercel Dashboard → Settings → Environment Variables, add:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_APP_URL` (your Vercel deployment URL)

3. **Deploy**

   - Push to `main` branch to trigger automatic deployment
   - Or manually deploy from Vercel Dashboard

4. **Configure Webhook URL**

   - In Razorpay Dashboard → Settings → Webhooks
   - Add webhook URL: `https://your-app.vercel.app/api/webhooks/razorpay`
   - Select events: `payment.captured`, `payment.failed`

### PDF Generation on Vercel

PDF generation using pdfkit may encounter execution time limits on Vercel serverless functions (10s on Hobby plan). If you experience timeouts:

1. **Recommended**: Move PDF generation to a Supabase Edge Function
2. **Alternative**: Use a background job queue (e.g., BullMQ, Inngest)
3. **Alternative**: Upgrade to Vercel Pro plan (60s timeout)

See `src/lib/pdf.ts` for implementation details and operational notes.

## Project Structure

```
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   │   ├── score/         # Score calculation endpoint
│   │   │   ├── report/        # Report generation endpoints
│   │   │   └── webhooks/      # Razorpay webhook handler
│   │   ├── assess/            # Assessment form page
│   │   └── result/            # Result display page
│   ├── components/            # React components
│   │   ├── FormStepper.tsx   # Multi-step form
│   │   ├── ScoreGauge.tsx    # Score visualization
│   │   ├── PaymentWidget.tsx  # Razorpay checkout
│   │   └── ...
│   ├── lib/                   # Utilities and helpers
│   │   ├── score.ts          # PFHR scoring engine
│   │   ├── pdf.ts            # PDF generation
│   │   ├── razorpay.ts        # Razorpay integration
│   │   └── ...
│   └── __tests__/            # Test files
├── sql/                      # Database schema scripts
├── scripts/                   # Utility scripts
└── docs/                     # Documentation
```

## API Documentation

### POST `/api/score/calculate`

Calculate PFHR score from user inputs.

**Request Body:**
```json
{
  "monthly_income": 500000,
  "monthly_expenses": 300000,
  "emergency_fund": 1000000,
  "total_debt": 500000,
  "monthly_debt_payment": 20000,
  "savings_rate": 40,
  "investment_amount": 200000,
  "investment_knowledge": "intermediate"
}
```

**Response:**
```json
{
  "score": 75.5,
  "category": "healthy",
  "breakdown": {
    "emergency_fund_score": 85.0,
    "debt_score": 80.0,
    "savings_rate_score": 70.0,
    "investment_readiness_score": 75.0,
    "financial_knowledge_score": 60.0
  },
  "submission_id": "uuid"
}
```

### POST `/api/report/create`

Create Razorpay order for PDF report purchase. Requires authentication.

**Headers:**
```
Authorization: Bearer <user_id>
Content-Type: application/json
```

**Request Body:**
```json
{
  "submission_id": "uuid",
  "user_id": "uuid"
}
```

**Response:**
```json
{
  "order_id": "order_xxx",
  "amount": 900,
  "currency": "INR",
  "payment_id": "uuid"
}
```

### POST `/api/report/generate`

Manually trigger PDF generation for a submission. Requires authentication and ownership.

**Headers:**
```
Authorization: Bearer <user_id>
Content-Type: application/json
```

**Request Body:**
```json
{
  "submission_id": "uuid"
}
```

**Response:**
```json
{
  "pdf_url": "https://...",
  "report_id": "uuid"
}
```

### GET `/api/report/[report_id]`

Retrieve PDF report URL (authenticated, owner-only).

**Headers:**
```
Authorization: Bearer <user_id>
```

**Response:**
```json
{
  "pdf_url": "https://...",
  "report_id": "uuid",
  "submission_id": "uuid"
}
```

### POST `/api/webhooks/razorpay`

Razorpay webhook handler for payment events. Requires valid HMAC-SHA256 signature.

**Headers:**
```
X-Razorpay-Signature: <hmac_sha256_signature>
Content-Type: application/json
```

**Request Body:**
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_xxx",
        "order_id": "order_xxx",
        "amount": 900,
        "currency": "INR",
        "status": "captured"
      }
    }
  }
}
```

**Response:**
```json
{
  "received": true
}
```

### API Testing

Import `postman_collection.json` into Postman for complete API examples with sample requests and responses.

## Security

See `SECURITY.md` for detailed security documentation including:

- Secret handling
- Supabase service role key usage
- Row Level Security (RLS) notes
- Webhook signature verification
- Authentication flow

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For issues and questions, please contact the development team.
