# Fynly Demo Application

Interactive demo showcasing Fynly: Discover, book, and connect with verified financial advisors.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Fynly/demo

# Install dependencies
npm install

# Generate mock data (50 advisors, 200 investors)
npm run seed

# Start development server
npm run dev
```

Visit `http://localhost:3001` to see the demo.

## 📊 Features

### Investor Experience
- **Discover Page**: Search and filter 50+ advisors with AI-powered matching
- **Advisor Profiles**: Detailed view with reviews, expertise, and availability
- **Booking Flow**: Calendar-based scheduling with simulated payment
- **Video Call**: Simulated Daily.co-style video call interface
- **Dashboard**: Portfolio breakdown, upcoming sessions, news feed, success stories

### Advisor Experience
- **Dashboard**: View earnings, clients, and session management

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS (Neo-Finance Hybrid theme)
- **Data**: Mock data generated with Faker.js
- **Charts**: Recharts
- **Search**: Fuse.js for fuzzy search
- **State**: SWR for data fetching

## 📁 Project Structure

```
demo/
├── src/
│   ├── app/              # Next.js pages
│   │   ├── discover/     # Advisor discovery page
│   │   ├── advisor/      # Advisor profile pages
│   │   ├── dashboard/     # Investor dashboard
│   │   ├── demo-call/     # Video call simulation
│   │   └── api/           # API routes
│   ├── components/        # React components
│   │   ├── ui/            # Base UI components
│   │   ├── advisor/       # Advisor-specific components
│   │   ├── booking/        # Booking flow components
│   │   └── providers/     # Context providers
│   ├── lib/               # Utilities
│   └── types/             # TypeScript types
├── data/seed/             # Generated mock data (JSON)
├── scripts/               # Utility scripts
└── public/                # Static assets
```

## 🎯 Mock Data

The demo uses simulated data:

- **50 Advisors**: With ratings, expertise, availability slots, reviews
- **200 Investors**: With portfolio allocations and investment goals
- **Bookings**: Mix of past and upcoming sessions
- **News**: Financial articles and market updates
- **Success Stories**: Investor testimonials

Generate mock data:
```bash
npm run seed
```

## 🔌 API Routes

All API routes are Next.js API routes (no external backend required):

- `GET /api/advisors` - List advisors (paginated, filtered, sorted)
- `GET /api/advisors/[id]` - Get advisor details
- `GET /api/match` - AI-matched advisors (simulated)
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `POST /api/payment/simulate` - Simulate payment
- `POST /api/webhook/simulate` - Simulate webhook
- `POST /api/simulate-recording` - Generate recording URL
- `GET /api/dashboard` - Dashboard data

## 🎨 Demo User Sessions

Two mock users are available:

1. **Investor**: `investor-demo-001`
   - Name: Rajesh Kumar
   - Email: rajesh.kumar@demo.fynly.com

2. **Advisor**: `advisor-demo-001`
   - Name: Priya Sharma
   - Email: priya.sharma@demo.fynly.com

Users are stored in localStorage and persist across page refreshes.

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (when implemented)
npm test

# E2E tests (when implemented)
npm run test:e2e
```

## 📦 Build & Deploy

### Build

```bash
npm run build
npm start
```

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables (see `.env.example`)
4. Deploy!

Or use Vercel CLI:
```bash
npm i -g vercel
vercel
```

## 🎭 Demo Flow

### Investor Journey

1. **Home** → Select "Investor" role
2. **Discover** → Search/browse advisors, view AI matches
3. **Advisor Profile** → View details, reviews, expertise
4. **Book Session** → Select date/time, duration, add notes
5. **Payment** → Simulated Razorpay payment (demo mode)
6. **Dashboard** → View portfolio, upcoming sessions, news
7. **Join Call** → Simulated video call with controls
8. **Post-Call** → Recording generated, redirect to dashboard

### Advisor Journey

1. **Home** → Select "Advisor" role
2. **Dashboard** → View earnings, clients, sessions

## 📝 Environment Variables

Create `.env.local`:

```env
MOCK_MODE=true
NEXT_PUBLIC_API_BASE=http://localhost:3001/api
TZ=Asia/Kolkata
NEXT_PUBLIC_CURRENCY=INR
```

## 🎯 Investor Pitch Demo Script

1. **Discovery**: Show search with AI matches (3 top advisors)
2. **Advisor Profile**: Highlight ratings, reviews, SEBI registration
3. **Booking Flow**: Demonstrate calendar selection and payment
4. **Dashboard**: Show portfolio breakdown chart and upcoming sessions
5. **Video Call**: Join simulated call, toggle mic/camera
6. **Success Stories**: Highlight ROI percentages and testimonials

## 🐛 Troubleshooting

### Data not loading
- Ensure `npm run seed` has been executed
- Check that `data/seed/*.json` files exist

### Build errors
- Run `npm run type-check` to identify TypeScript errors
- Ensure all dependencies are installed: `npm install`

### Port already in use
- Change port in `package.json`: `"dev": "next dev -p 3002"`

## 📄 License

This is a demo application for demonstration purposes.

## 🤝 Contributing

This is a demo application. For production use, replace mock data and APIs with real backend services.

---

**Note**: This is a fully simulated demo. No real payments, video calls, or data are processed. All integrations are mocked for demonstration purposes.

