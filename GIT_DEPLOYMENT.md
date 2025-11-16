# Git Deployment Instructions

## Quick Deploy to GitHub

Run these commands in your terminal:

```bash
# Navigate to project directory
cd "C:\Users\Shreyash\Documents\Fynly 2.0"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Phase 10: Complete MVP implementation with tests, CI/CD, and documentation"

# Add remote repository
git remote add origin https://github.com/Shreyash3007/fynly.git
# OR if remote already exists:
git remote set-url origin https://github.com/Shreyash3007/fynly.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

## If You Get Authentication Errors

### Option 1: Use Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` scope
3. Use token as password when pushing:

```bash
git push -u origin main
# Username: Shreyash3007
# Password: <your_personal_access_token>
```

### Option 2: Use SSH

```bash
# Change remote to SSH
git remote set-url origin git@github.com:Shreyash3007/fynly.git

# Push
git push -u origin main
```

## Verify Deployment

After pushing, check:
- [https://github.com/Shreyash3007/fynly](https://github.com/Shreyash3007/fynly) - All files should be visible
- CI/CD should run automatically (check Actions tab)

## Next Steps After Git Push

1. **Set up Vercel deployment** (see `DEPLOYMENT_GUIDE.md`)
2. **Configure Supabase database** (run SQL scripts)
3. **Set environment variables in Vercel**
4. **Test the deployment**

