# Deployment Guide - Fynly MVP v1.0

## Quick Deployment Steps

### 1. Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add remote repository
git remote add origin https://github.com/Shreyash3007/fynly.git
# OR if remote exists:
git remote set-url origin https://github.com/Shreyash3007/fynly.git

# Add all files
git add .

# Commit
git commit -m "Phase 10: Complete MVP implementation"

# Push to main branch
git branch -M main
git push -u origin main
```

### 2. Set Up Supabase Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `vmhcewicmfffzrjeyxnm`
3. Go to SQL Editor and run these scripts in order:
   - `sql/create_tables.sql`
   - `sql/add_payments_table.sql`
   - `sql/add_reports_table.sql`

4. Create Storage Bucket:
   - Go to Storage → Create Bucket
   - Name: `reports`
   - Set to **Public** (or configure RLS for private access)

### 3. Deploy to Vercel

#### Option A: Via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import from GitHub: `Shreyash3007/fynly`
4. Configure environment variables (see below)
5. Deploy!

#### Option B: Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

### 4. Configure Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL=https://vmhcewicmfffzrjeyxnm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaGNld2ljbWZmZnpyamV5eG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNzE2OTcsImV4cCI6MjA3ODg0NzY5N30.QZl4xIi4RopkB4oiTlz2d-W2gqBNva6TNNIby4gv6do
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaGNld2ljbWZmZnpyamV5eG5tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzI3MTY5NywiZXhwIjoyMDc4ODQ3Njk3fQ.DciViyENv7p3Hk0Bp-_73RlmZk9N_LLMHGYo5dUhKBg
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Optional (for payments):**
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

**Important:** Replace `https://your-app.vercel.app` with your actual Vercel deployment URL after first deployment.

### 5. Configure Razorpay Webhook (if using payments)

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Settings → Webhooks
3. Add webhook URL: `https://your-app.vercel.app/api/webhooks/razorpay`
4. Select events:
   - `payment.captured`
   - `payment.failed`
5. Copy the webhook secret and add to Vercel environment variables as `RAZORPAY_WEBHOOK_SECRET`

### 6. Verify Deployment

1. Visit your Vercel deployment URL
2. Test the assessment flow: `/assess`
3. Complete an assessment and view results
4. Test payment flow (if configured)

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/Shreyash3007/fynly.git
cd fynly
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create `.env.local`

Copy `env.example` to `.env.local`:

```bash
cp env.example .env.local
```

The `.env.local` file should contain:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vmhcewicmfffzrjeyxnm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaGNld2ljbWZmZnpyamV5eG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNzE2OTcsImV4cCI6MjA3ODg0NzY5N30.QZl4xIi4RopkB4oiTlz2d-W2gqBNva6TNNIby4gv6do
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaGNld2ljbWZmZnpyamV5eG5tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzI3MTY5NywiZXhwIjoyMDc4ODQ3Njk3fQ.DciViyENv7p3Hk0Bp-_73RlmZk9N_LLMHGYo5dUhKBg
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Post-Deployment Checklist

- [ ] Database schema applied in Supabase
- [ ] Storage bucket `reports` created
- [ ] Environment variables set in Vercel
- [ ] Razorpay webhook configured (if using payments)
- [ ] Test assessment flow
- [ ] Test payment flow (if configured)
- [ ] Verify PDF generation works
- [ ] Check Vercel function logs for errors
- [ ] Monitor Supabase logs

## Troubleshooting

### Build Fails

- Check environment variables are set in Vercel
- Verify all required variables are present
- Check Vercel build logs for specific errors

### Database Connection Issues

- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Verify RLS policies allow access

### PDF Generation Timeouts

- See `README.md` for PDF generation notes
- Consider moving to Supabase Edge Function
- Or upgrade to Vercel Pro plan

### Webhook Not Working

- Verify webhook URL is correct in Razorpay Dashboard
- Check `RAZORPAY_WEBHOOK_SECRET` is set in Vercel
- Verify signature verification is working
- Check Vercel function logs

## Security Notes

⚠️ **Important:** The Supabase keys are included in `env.example` for convenience, but:

1. **Never commit `.env.local`** to git (it's in `.gitignore`)
2. **Rotate keys** if they're exposed in a public repository
3. **Use Vercel environment variables** for production secrets
4. **Review RLS policies** before going to production

## Support

For issues:
- Check `README.md` for detailed documentation
- Review `SECURITY.md` for security best practices
- Check Vercel and Supabase logs
- Review test files for usage examples

