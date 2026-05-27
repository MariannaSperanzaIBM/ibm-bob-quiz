#!/bin/bash

# IBM Bob Quiz - Quick Deployment Setup Script
# This script helps you prepare your project for deployment

echo "🚀 IBM Bob Quiz - Deployment Setup"
echo "=================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first:"
    echo "   macOS: brew install git"
    echo "   Or download from: https://git-scm.com/downloads"
    exit 1
fi

echo "✅ Git is installed"
echo ""

# Check if already a git repository
if [ -d .git ]; then
    echo "⚠️  This is already a Git repository"
    echo ""
else
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
    echo ""
fi

# Add all files
echo "📝 Adding files to Git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
else
    echo "💾 Creating initial commit..."
    git commit -m "Initial commit - IBM Bob Quiz game ready for deployment"
    echo "✅ Files committed"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next Steps:"
echo "==========="
echo ""
echo "1. Create a GitHub repository:"
echo "   - Go to https://github.com/new"
echo "   - Create a new repository (don't initialize with README)"
echo ""
echo "2. Push your code to GitHub:"
echo "   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Deploy to a hosting platform:"
echo "   - Render: https://render.com (Recommended)"
echo "   - Railway: https://railway.app"
echo "   - Glitch: https://glitch.com"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions!"
echo ""

# Made with Bob
