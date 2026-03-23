# Planning Poker App

A modern planning poker application built with React + Vite, featuring multiple layout modes and Supabase integration.

## Features

- 🎯 **Multiple Layout Modes**: Generic role selection or fixed PEGA/QA/ACM roles
- 🔄 **Real-time Collaboration**: Live planning poker sessions
- ☁️ **Supabase Integration**: Database and real-time subscriptions
- 🚀 **Multi-environment Deployment**: Isolated staging and production environments

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build:prod
```

## Deployment

### Staging Environment

Deploy to staging with a single command:

```bash
# Quick deploy (commit and deploy)
./deploy-staging.ps1 "Add new feature"

# Or using npm script
npm run deploy:staging

# Or using batch file
./deploy-staging.bat
```

### Production Environment

Deploy to production by merging staging to main:

```bash
git checkout main
git merge staging
git push origin main
```

### Environment Variables

Each environment uses separate Supabase projects:

- **Production**: Uses production Supabase database, generic layout disabled
- **Staging**: Uses staging Supabase database, generic layout enabled
- **Development**: Uses local/development Supabase database, generic layout enabled

## URL Parameters

- `?v=lifecycle` - Forces PEGA/QA/ACM role selection (legacy mode)
- Default - Generic role selection (new mode, staging only)

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Deployment**: Vercel
- **Styling**: Custom CSS with modern design system
update
