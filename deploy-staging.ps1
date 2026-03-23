param(
    [string]$CommitMessage = "Deploy to staging",
    [string]$WebhookUrl = "REPLACE_WITH_YOUR_NEW_WEBHOOK_URL"
)

Write-Host "🚀 Deploying to Vercel Staging..." -ForegroundColor Green
Write-Host "📝 Commit message: $CommitMessage" -ForegroundColor Yellow

# Add all changes
git add .

# Commit changes
git commit -m "$CommitMessage"

# Push to staging branch
git push origin staging

# Trigger Vercel deployment
Write-Host "🔄 Triggering Vercel deployment..." -ForegroundColor Cyan
if ($WebhookUrl -eq "REPLACE_WITH_YOUR_NEW_WEBHOOK_URL") {
    Write-Host "❌ Please update the WebhookUrl parameter with your new Vercel webhook URL" -ForegroundColor Red
    Write-Host "   Get it from: Vercel Dashboard → storyscore-stg → Settings → Git → Deploy Hooks" -ForegroundColor Yellow
    exit 1
}

try {
    $response = Invoke-WebRequest -Uri $WebhookUrl -Method POST -UseBasicParsing
    Write-Host "✅ Deployment triggered successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to trigger deployment: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "📊 Check Vercel dashboard: https://vercel.com/dashboard" -ForegroundColor Blue
Write-Host "🌐 Staging URL will be updated automatically" -ForegroundColor Blue