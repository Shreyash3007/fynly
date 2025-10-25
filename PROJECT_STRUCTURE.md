# 📁 Project Structure - Fynly

## 🗂️ Directory Organization

```
Fynly/
│
├── 📄 Configuration Files
│   ├── .env.local              # Environment variables (✅ configured)
│   ├── .env.local.example      # Environment template
│   ├── package.json            # Dependencies & scripts
│   ├── tsconfig.json           # TypeScript configuration
│   ├── tailwind.config.ts      # Tailwind CSS config
│   ├── next.config.js          # Next.js configuration
│   ├── firebase.json           # Firebase hosting config
│   ├── jest.config.js          # Jest testing config
│   ├── cypress.config.ts       # Cypress E2E config
│   └── postcss.config.js       # PostCSS config
│
├── 📚 Documentation
│   ├── README.md               # Main documentation
│   ├── GETTING_STARTED.md      # Setup guide (start here!)
│   ├── QUICK_START.md          # Quick reference
│   ├── SETUP_COMPLETE.md       # Current setup status
│   ├── CONTRIBUTING.md         # Contribution guidelines
│   ├── SECURITY.md             # Security policies
│   ├── LICENSE                 # MIT License
│   └── PROJECT_STRUCTURE.md    # This file
│
├── 📜 Scripts
│   ├── setup.bat               # Windows CMD setup
│   ├── setup.ps1               # PowerShell setup
│   ├── deploy.bat              # Windows deployment
│   ├── deploy.ps1              # PowerShell deployment
│   └── db-seed.sql             # Database seeding
│
├── 🎨 Source Code (src/)
│   │
│   ├── app/                    # Next.js App Router
│   │   │
│   │   ├── (auth)/             # Authentication Pages
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   │
│   │   ├── (investor)/         # Investor Pages
│   │   │   ├── advisors/
│   │   │   │   ├── page.tsx              # Browse advisors
│   │   │   │   └── [id]/page.tsx         # Advisor detail
│   │   │   ├── bookings/
│   │   │   │   └── new/page.tsx          # Create booking
│   │   │   └── dashboard/page.tsx        # Investor dashboard
│   │   │
│   │   ├── (advisor)/          # Advisor Pages
│   │   │   ├── advisor/
│   │   │   │   ├── onboarding/page.tsx   # Advisor onboarding
│   │   │   │   └── dashboard/page.tsx    # Advisor dashboard
│   │   │
│   │   ├── (admin)/            # Admin Panel
│   │   │   └── admin/
│   │   │       ├── dashboard/page.tsx    # Admin dashboard
│   │   │       └── advisors/
│   │   │           └── pending/page.tsx  # Advisor approvals
│   │   │
│   │   ├── api/                # Backend API Routes
│   │   │   ├── advisors/       # Advisor CRUD
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── bookings/       # Booking management
│   │   │   │   └── route.ts
│   │   │   ├── payments/       # Payment processing
│   │   │   │   ├── create-order/route.ts
│   │   │   │   └── verify/route.ts
│   │   │   ├── webhooks/       # External webhooks
│   │   │   │   └── razorpay/route.ts
│   │   │   └── admin/          # Admin operations
│   │   │       └── advisors/
│   │   │           ├── pending/route.ts
│   │   │           └── [id]/
│   │   │               ├── approve/route.ts
│   │   │               └── reject/route.ts
│   │   │
│   │   ├── auth/callback/      # OAuth callback
│   │   │   └── route.ts
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   │
│   ├── components/             # React Components
│   │   └── ui/                 # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Textarea.tsx
│   │       ├── Modal.tsx
│   │       └── index.ts
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useAuth.ts          # Authentication hook
│   │   ├── useBookings.ts      # Bookings hook
│   │   ├── useAdvisors.ts      # Advisors hook
│   │   └── index.ts
│   │
│   ├── lib/                    # Core Utilities
│   │   ├── supabase/           # Database
│   │   │   ├── client.ts       # Browser client
│   │   │   ├── server.ts       # Server client
│   │   │   └── middleware.ts   # Auth middleware
│   │   ├── razorpay/           # Payments
│   │   │   └── client.ts
│   │   ├── daily/              # Video calls
│   │   │   └── client.ts
│   │   ├── email/              # Email service
│   │   │   └── client.ts
│   │   └── auth/               # Auth actions
│   │       └── actions.ts
│   │
│   ├── store/                  # State Management (Zustand)
│   │   ├── authStore.ts        # Auth state
│   │   ├── bookingStore.ts     # Booking state
│   │   └── index.ts
│   │
│   ├── types/                  # TypeScript Types
│   │   └── database.ts         # Database types
│   │
│   ├── styles/                 # Global Styles
│   │   └── globals.css         # Tailwind + custom CSS
│   │
│   └── middleware.ts           # Next.js middleware
│
├── 🗄️ Supabase
│   ├── config.toml             # Supabase CLI config
│   ├── migrations/             # Database Migrations
│   │   ├── 20240101000001_init_schema.sql      # Tables & indexes
│   │   ├── 20240101000002_rls_policies.sql     # Security policies
│   │   └── 20240101000003_auth_triggers.sql    # Auth sync
│   └── functions/              # Edge Functions
│       ├── _shared/cors.ts     # Shared CORS config
│       └── razorpay-webhook/   # Payment webhooks
│           └── index.ts
│
└── 🧪 Tests
    ├── unit/                   # Unit Tests (Jest)
    │   └── lib/
    │       ├── auth.test.ts
    │       ├── razorpay.test.ts
    │       └── daily.test.ts
    └── e2e/                    # E2E Tests (Cypress)
        ├── auth.cy.ts
        └── support/
            ├── commands.ts
            └── e2e.ts
```

---

## 🎯 Key Directories

### `/src/app` - Application Pages & API

- **Route Groups:** `(auth)`, `(investor)`, `(advisor)`, `(admin)`
- **Purpose:** Organize routes without affecting URLs
- **API Routes:** RESTful endpoints in `/api`

### `/src/components` - Reusable Components

- **UI Library:** Button, Card, Input, Modal, etc.
- **Fully typed** with TypeScript
- **Styled** with Tailwind CSS

### `/src/lib` - Core Integrations

- **Supabase:** Database & authentication
- **Razorpay:** Payment processing
- **Daily.co:** Video consultations
- **Resend:** Email notifications

### `/src/hooks` - Custom Hooks

- **useAuth:** User authentication state
- **useBookings:** Booking management
- **useAdvisors:** Advisor data fetching

### `/supabase` - Database

- **migrations/:** SQL schema files
- **functions/:** Serverless edge functions

### `/scripts` - Automation

- **setup:** Install & configure
- **deploy:** Deploy to Firebase

---

## 📝 File Naming Conventions

### Pages
- `page.tsx` - Route component
- `layout.tsx` - Layout component
- `loading.tsx` - Loading UI
- `error.tsx` - Error UI

### API Routes
- `route.ts` - API endpoint
- `[id]/route.ts` - Dynamic route

### Components
- `ComponentName.tsx` - PascalCase
- `index.ts` - Barrel export

### Utilities
- `serviceName.ts` - camelCase
- `*.test.ts` - Test files

---

## 🔄 Data Flow

```
User Request
    ↓
Middleware (auth check)
    ↓
Page Component (SSR/SSG)
    ↓
API Route (if needed)
    ↓
Lib Function (Supabase/Razorpay/Daily)
    ↓
Database / External API
    ↓
Response to User
```

---

## 🛡️ Security Layers

1. **Row-Level Security (RLS)** - Database level
2. **Middleware** - Route protection
3. **API Validation** - Input validation
4. **Environment Variables** - Secret management

---

## 🔧 Adding New Features

### New Page
```typescript
// src/app/(investor)/new-page/page.tsx
export default function NewPage() {
  return <div>New Page</div>
}
```

### New API Endpoint
```typescript
// src/app/api/new-endpoint/route.ts
export async function GET(request: NextRequest) {
  return NextResponse.json({ data: "response" })
}
```

### New Component
```typescript
// src/components/ui/NewComponent.tsx
export function NewComponent() {
  return <div>Component</div>
}
```

---

## 📦 Dependencies

### Core (Production)
- **Next.js 14** - React framework
- **React 18** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 3** - Styling
- **@supabase/supabase-js** - Database
- **razorpay** - Payments
- **@daily-co/daily-js** - Video
- **resend** - Email
- **zustand** - State management
- **zod** - Validation

### Dev Dependencies
- **Jest** - Unit testing
- **Cypress** - E2E testing
- **ESLint** - Linting
- **Prettier** - Formatting
- **TypeScript** - Type checking

---

## 🎨 Styling System

### Tailwind Classes
```typescript
// Utility classes
className="bg-primary-600 text-white rounded-xl"

// Custom classes (globals.css)
className="btn btn-primary"
className="card card-hover"
```

### Custom CSS Variables
```css
--font-inter: 'Inter', system-ui, sans-serif;
--font-nunito: 'Nunito', 'Inter', sans-serif;
```

---

## 🚀 Build Process

```
Development: npm run dev
    ↓
TypeScript Compilation
    ↓
Tailwind CSS Processing
    ↓
Next.js Bundling
    ↓
Production: npm run build
    ↓
Firebase Deployment
```

---

## ✅ Clean Structure Benefits

- ✅ **Clear separation** of concerns
- ✅ **Easy navigation** with organized folders
- ✅ **Scalable** architecture
- ✅ **Type-safe** throughout
- ✅ **Well documented** code
- ✅ **Test coverage** included
- ✅ **Production ready**

---

**This structure is designed for:**
- 🎯 Easy maintenance
- 🔄 Quick feature addition
- 👥 Team collaboration
- 📈 Future scaling
- 🛡️ Security best practices

---

**Need help?** Check `GETTING_STARTED.md` or `README.md`

