#!/bin/bash

# Deploy to Staging Script
# Usage: ./deploy-staging.sh "Your commit message"

COMMIT_MESSAGE=${1:-"Deploy to staging"}
WEBHOOK_URL=${2:-"REPLACE_WITH_YOUR_NEW_WEBHOOK_URL"}

echo "🚀 Deploying to Vercel Staging..."
echo "📝 Commit message: $COMMIT_MESSAGE"

if [ "$WEBHOOK_URL" = "REPLACE_WITH_YOUR_NEW_WEBHOOK_URL" ]; then
    echo "❌ Please provide your new Vercel webhook URL"
    echo "   Get it from: Vercel Dashboard → storyscore-stg → Settings → Git → Deploy Hooks"
    echo "   Usage: ./deploy-staging.sh \"commit message\" \"webhook-url\""
    exit 1
fi

# Add all changes
git add .

# Commit changes
git commit -m "$COMMIT_MESSAGE"

# Push to staging branch
git push origin staging

# Trigger Vercel deployment
echo "🔄 Triggering Vercel deployment..."
curl -X POST "$WEBHOOK_URL"

echo "✅ Deployment triggered!"
echo "📊 Check Vercel dashboard: https://vercel.com/dashboard"
echo "🌐 Staging URL will be updated automatically"