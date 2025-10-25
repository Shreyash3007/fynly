# 🚀 Getting Started with Fynly

**Complete Setup Guide - One Page, Everything You Need**

---

## 📋 Prerequisites

- ✅ Node.js 18+ installed
- ✅ npm 9+ installed
- ✅ Git (optional)

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Install Dependencies

```powershell
npm install
```

### Step 2: Configure Environment

Your `.env.local` is already configured with:

```env
✅ Supabase URL & Keys
✅ Daily.co API Key
✅ Resend API Key
✅ Firebase Project ID
⏭️ Razorpay (skipped)
```

### Step 3: Setup Database

**Open Supabase SQL Editor:**
https://supabase.com/dashboard/project/yzbopliavpqiicvyqvun/sql/new

**Run these 3 SQL files** (copy/paste and click Run):

1. `supabase/migrations/20240101000001_init_schema.sql` - Creates tables
2. `supabase/migrations/20240101000002_rls_policies.sql` - Security policies
3. `supabase/migrations/20240101000003_auth_triggers.sql` - Auth sync

### Step 4: Start Development

```powershell
npm run dev
```

**Open:** http://localhost:3000

---

## 🎯 Verify Setup

### Test the Application

1. **Homepage** - http://localhost:3000 should load
2. **Sign Up** - Create an investor account
3. **Database** - Check Supabase Dashboard → users table
4. **Browse** - Go to /advisors page

---

## 📚 Project Structure

```
Fynly/
├── src/
│   ├── app/                    # Next.js pages & API routes
│   │   ├── (admin)/           # Admin panel pages
│   │   ├── (advisor)/         # Advisor pages
│   │   ├── (investor)/        # Investor pages
│   │   ├── (auth)/            # Login/Signup
│   │   └── api/               # Backend API routes
│   ├── components/ui/         # Reusable components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Core utilities
│   │   ├── supabase/         # Database client
│   │   ├── razorpay/         # Payment integration
│   │   ├── daily/            # Video calls
│   │   └── email/            # Email service
│   ├── store/                # State management
│   └── types/                # TypeScript types
├── supabase/
│   ├── migrations/           # Database schema
│   └── functions/            # Edge functions
├── scripts/                  # Setup & deployment
├── tests/                    # Unit & E2E tests
└── docs/                     # Documentation
```

---

## 🔧 Configuration

### Environment Variables (`.env.local`)

All keys are already configured:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yzbopliavpqiicvyqvun.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=***
SUPABASE_SERVICE_ROLE_KEY=***
NEXT_PUBLIC_DAILY_API_KEY=***
RESEND_API_KEY=***
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fynly-financial-advisor
```

---

## 🛠️ Available Commands

### Development
```powershell
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Check code quality
npm run type-check       # TypeScript validation
```

### Testing
```powershell
npm run test             # Run unit tests
npm run test:watch       # Tests in watch mode
npm run test:e2e         # Run E2E tests
```

### Deployment
```powershell
.\scripts\deploy.ps1     # Deploy to Firebase
```

---

## 🎓 Create Admin User

After signing up, make yourself admin:

```sql
-- Run in Supabase SQL Editor
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

Then access: http://localhost:3000/admin/dashboard

---

## 📱 Features

### For Investors
- Browse & search advisors
- View profiles & reviews
- Book consultations
- Video calls
- Leave reviews

### For Advisors
- Complete professional profile
- Manage bookings
- Conduct video sessions
- Track earnings

### For Admins
- Approve/reject advisors
- Monitor platform activity
- View analytics
- Manage users

---

## 🚀 Deployment

### Deploy to Firebase

```powershell
# Build the application
npm run build

# Deploy to hosting
firebase deploy --only hosting
```

**Project Console:** https://console.firebase.google.com/project/fynly-financial-advisor

---

## 🔗 Important Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/yzbopliavpqiicvyqvun
- **Firebase Console:** https://console.firebase.google.com/project/fynly-financial-advisor
- **Daily.co Dashboard:** https://dashboard.daily.co
- **Resend Dashboard:** https://resend.com/dashboard

---

## 🆘 Troubleshooting

### "Cannot connect to Supabase"
- Check `.env.local` has correct keys
- Restart dev server

### "Table not found"
- Run database migrations in Supabase SQL Editor

### "Port 3000 in use"
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Module not found"
```powershell
rm -rf node_modules
npm install
```

---

## 📖 Additional Documentation

- **README.md** - Full project documentation
- **QUICK_START.md** - Alternative quick start guide
- **SETUP_COMPLETE.md** - Detailed setup status
- **CONTRIBUTING.md** - Contribution guidelines
- **SECURITY.md** - Security policies

---

## ✅ Setup Checklist

- ✅ Dependencies installed
- ✅ Environment configured
- ⚠️ Database migrations (run in Supabase Dashboard)
- ✅ Development server ready

**You're ready to build! 🎉**

---

## 🎯 Next Steps

1. Run database migrations (3 minutes)
2. Start dev server: `npm run dev`
3. Sign up as investor
4. Test the application
5. Create admin account
6. Start building features!

---

**Questions?** Check README.md or create an issue.

**Happy coding! 🚀**

