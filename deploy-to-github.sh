#!/bin/bash
# Fynly MVP v1.0 - GitHub Deployment Script

echo "🚀 Deploying Fynly MVP to GitHub..."

# Step 1: Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "📥 Install it from: https://cli.github.com/"
    exit 1
fi

# Step 2: Check if logged in
if ! gh auth status &> /dev/null; then
    echo "🔐 Please login to GitHub..."
    gh auth login
fi

# Step 3: Initialize git if needed
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Step 4: Add all files
echo "📝 Adding files to git..."
git add .

# Step 5: Commit
echo "💾 Committing changes..."
git commit -m "Phase 10: Complete MVP implementation with Supabase integration" || echo "No changes to commit"

# Step 6: Create repository on GitHub (if it doesn't exist)
REPO_NAME="fynly"
echo "🔨 Creating repository: $REPO_NAME..."

# Check if repo already exists
if gh repo view Shreyash3007/$REPO_NAME &> /dev/null; then
    echo "✅ Repository already exists, skipping creation..."
    git remote remove origin 2>/dev/null
    git remote add origin https://github.com/Shreyash3007/$REPO_NAME.git
else
    echo "🆕 Creating new repository..."
    gh repo create Shreyash3007/$REPO_NAME --public --source=. --remote=origin --push
    exit 0
fi

# Step 7: Push to GitHub
echo "⬆️  Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "✅ Deployment complete!"
echo "🌐 Repository: https://github.com/Shreyash3007/$REPO_NAME"
echo "🚀 Vercel will automatically deploy from GitHub!"

