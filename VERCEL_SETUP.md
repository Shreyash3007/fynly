# Vercel Deployment Setup

The demo has been successfully pushed to GitHub: `https://github.com/Shreyash3007/fynly.git`

## Deploy to Vercel

### Option 1: One-Click Deploy (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import repository: `Shreyash3007/fynly`
4. Vercel will auto-detect Next.js and configure:
   - Framework: Next.js
   - Root Directory: `.` (root of repo)
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Click **"Deploy"**

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to demo directory (or root if demo is root)
cd demo

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: fynly-demo
# - Directory: .
# - Override settings? No
```

### Important Configuration

The repo is configured with:
- ✅ `vercel.json` - Build settings
- ✅ `package.json` - Includes `seed` script in install
- ✅ Mock data included in `data/seed/` directory
- ✅ No environment variables needed

### Build Settings (Auto-detected)

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Install Command**: `npm install && npm run seed`
- **Output Directory**: `.next`
- **Node Version**: 18.x

### Post-Deployment

Once deployed, your demo will be available at:
- `https://your-project.vercel.app`

The app will:
1. Run `npm install` to install dependencies
2. Run `npm run seed` to generate mock data
3. Build the Next.js application
4. Deploy automatically

### Troubleshooting

**Build Fails:**
- Check that `data/seed/` directory exists with JSON files
- Verify Node.js version is 18+
- Check build logs in Vercel dashboard

**404 Errors:**
- Ensure `npm run seed` completed successfully
- Check that `data/seed/*.json` files are in repository

**Type Errors:**
- Run `npm run type-check` locally first
- Ensure all dependencies are in `package.json`

### Continuous Deployment

Once connected, Vercel will automatically deploy on every push to `main` branch.

---

**Status**: ✅ Ready for Vercel deployment
**Repository**: https://github.com/Shreyash3007/fynly.git

