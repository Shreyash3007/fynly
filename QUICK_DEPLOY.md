# Quick Deploy to GitHub - Step by Step

## ✅ Step 1: Create Repository on GitHub (Manual)

Since GitHub CLI is not installed, create the repository on GitHub website:

1. **Go to GitHub**: https://github.com/new
2. **Repository name**: `fynly` (or your preferred name)
3. **Description**: `Fynly MVP v1.0 - Financial Health Assessment Platform`
4. **Visibility**: Choose Public or Private
5. **⚠️ IMPORTANT**:
   - ❌ **DO NOT** check "Add a README file"
   - ❌ **DO NOT** check "Add .gitignore"
   - ❌ **DO NOT** check "Choose a license"
     (We already have these files)
6. Click **Create repository**

## ✅ Step 2: Push Code (Run these commands)

After creating the repo, run these commands in your terminal:

```bash
# Add remote (replace Shreyash3007 with your GitHub username if different)
git remote add origin https://github.com/Shreyash3007/fynly.git

# If remote already exists, update it:
# git remote set-url origin https://github.com/Shreyash3007/fynly.git

# Push to GitHub
git push -u origin main
```

### If you get authentication errors:

**Option A: Use Personal Access Token**

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scope: `repo` (full control)
4. Copy the token
5. When pushing, use:
   - Username: `Shreyash3007`
   - Password: `<paste your token>`

**Option B: Use SSH** (if you have SSH keys set up)

```bash
git remote set-url origin git@github.com:Shreyash3007/fynly.git
git push -u origin main
```

## ✅ Step 3: Vercel Auto-Deployment

Once code is pushed to GitHub:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. If Vercel is connected to your GitHub account, you'll see the new repository
3. Click **Import** next to your `fynly` repository
4. **Configure Environment Variables**:
   - Go to Settings → Environment Variables
   - Add all variables from `env.example`:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://vmhcewicmfffzrjeyxnm.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaGNld2ljbWZmZnpyamV5eG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNzE2OTcsImV4cCI6MjA3ODg0NzY5N30.QZl4xIi4RopkB4oiTlz2d-W2gqBNva6TNNIby4gv6do
     SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaGNld2ljbWZmZnpyamV5eG5tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzI3MTY5NywiZXhwIjoyMDc4ODQ3Njk3fQ.DciViyENv7p3Hk0Bp-_73RlmZk9N_LLMHGYo5dUhKBg
     NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
     ```
   - **Note**: Replace `https://your-app.vercel.app` with your actual Vercel URL after first deployment
5. Click **Deploy**

Vercel will automatically deploy on every push to `main` branch! 🚀

## ✅ Step 4: Set Up Supabase Database

1. Go to: https://supabase.com/dashboard/project/vmhcewicmfffzrjeyxnm
2. SQL Editor → New Query
3. Run these scripts in order:
   - Copy/paste content from `sql/create_tables.sql` → Run
   - Copy/paste content from `sql/add_payments_table.sql` → Run
   - Copy/paste content from `sql/add_reports_table.sql` → Run
4. Storage → Create Bucket → Name: `reports` → Public → Create

## 🎉 Done!

Your app should now be live on Vercel and auto-deploying on every push!
