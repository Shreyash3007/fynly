# Create GitHub Repository and Push Instructions

## Step 1: Create Repository on GitHub

Since GitHub CLI is not installed, create the repository manually:

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Repository name: `fynly` (or any name you prefer)
4. Description: `Fynly MVP v1.0 - Financial Health Assessment Platform`
5. Set to **Public** or **Private** (your choice)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **Create repository**

## Step 2: Push Code to GitHub

After creating the repo, run these commands:

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/fynly.git

# Push to GitHub
git push -u origin main
```

If you get authentication errors, use a Personal Access Token:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use the token as password when pushing

## Alternative: Use SSH

If you have SSH keys set up:

```bash
# Add remote with SSH
git remote add origin git@github.com:YOUR_USERNAME/fynly.git

# Push
git push -u origin main
```

## Step 3: Verify Vercel Auto-Deployment

Once pushed to GitHub:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. If Vercel is connected to GitHub, it should detect the new repository
3. Click **Import Project** and select your `fynly` repository
4. Configure environment variables (see DEPLOYMENT_GUIDE.md)
5. Deploy!

Vercel will automatically deploy on every push to `main` branch.
