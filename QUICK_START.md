# ⚡ Fynly - Quick Reference

**5-Minute Setup - Essential Commands Only**

---

## 🚀 Setup Steps

### 1. Install Dependencies
```powershell
npm install
```

### 2. Configure Environment
Your `.env.local` is already configured with all API keys.

### 3. Setup Database
Open Supabase SQL Editor and run these 3 SQL files:
- https://supabase.com/dashboard/project/yzbopliavpqiicvyqvun/sql/new

Files to run:
1. `supabase/migrations/20240101000001_init_schema.sql`
2. `supabase/migrations/20240101000002_rls_policies.sql`
3. `supabase/migrations/20240101000003_auth_triggers.sql`

### 4. Start Development
```powershell
npm run dev
```

**Open:** http://localhost:3000

---

## 📋 Useful Commands

```powershell
npm run dev              # Development server
npm run build            # Production build
npm run test             # Run tests
npm run lint             # Check code
npm run type-check       # TypeScript check
```

---

## 🎯 Quick Tests

1. **Homepage** - http://localhost:3000
2. **Sign Up** - http://localhost:3000/signup
3. **Advisors** - http://localhost:3000/advisors
4. **Database** - Check Supabase Dashboard

---

## 🎓 Create Admin User

```sql
-- Run in Supabase SQL Editor
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

---

## 🔗 Quick Links

- **Supabase:** https://supabase.com/dashboard/project/yzbopliavpqiicvyqvun
- **Firebase:** https://console.firebase.google.com/project/fynly-financial-advisor
- **Daily.co:** https://dashboard.daily.co
- **Resend:** https://resend.com/dashboard

---

## 🆘 Troubleshooting

**Port 3000 in use:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Module not found:**
```powershell
rm -rf node_modules
npm install
```

**Database error:**
- Check migrations ran successfully
- Verify `.env.local` has correct keys
- Restart dev server

---

## 📚 Full Documentation

- **GETTING_STARTED.md** - Complete setup guide
- **PROJECT_STRUCTURE.md** - Code organization
- **README.md** - Full documentation
- **SETUP_COMPLETE.md** - Current status

---

**Ready to build! 🎉**
