#!/bin/bash

# Deploy to Staging Script
# Usage: ./deploy-staging.sh "Your commit message"

COMMIT_MESSAGE=${1:-"Deploy to staging"}

echo "🚀 Deploying to Vercel Staging..."
echo "📝 Commit message: $COMMIT_MESSAGE"

# Add all changes
git add .

# Commit changes
git commit -m "$COMMIT_MESSAGE"

# Push to staging branch
git push origin staging

# Trigger Vercel deployment
echo "🔄 Triggering Vercel deployment..."
curl -X POST https://api.vercel.com/v1/integrations/deploy/prj_lRYOhlEizpUUVzw0EYcfgPLV25Mm/iSksnsbBA3

echo "✅ Deployment triggered!"
echo "📊 Check Vercel dashboard: https://vercel.com/dashboard"
echo "🌐 Staging URL will be updated automatically"