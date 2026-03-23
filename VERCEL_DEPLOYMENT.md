# Vercel + Supabase Deployment Guide

## Setup for Different Environments

### **Production Deployment (Main Branch)**

1. Go to **Vercel Dashboard** > Your Project > **Settings** > **Environment Variables**

2. Add these variables for **Production** (leave default production git branch):
   ```
   VITE_SUPABASE_URL = https://your-prod-project.supabase.co
   VITE_SUPABASE_KEY = your-prod-anon-key
   VITE_ENABLE_GENERIC_LAYOUT = false
   VITE_APP_MODE = production
   ```

3. In **Settings** > **Build & Development Settings**:
   - Build Command: `npm run build:prod`
   - Keep it as is — Vercel auto-deploys from main branch

---

### **Staging Deployment (Separate Vercel Project)**

For true environment isolation, create a **second Vercel project**:

1. In Vercel Dashboard, click **Add New Project**
2. Select the **same GitHub repo** (planning-poker)
3. Name it: `planning-poker-staging`

4. Add **Environment Variables** for Staging:
   ```
   VITE_SUPABASE_URL = https://your-staging-project.supabase.co
   VITE_SUPABASE_KEY = your-staging-anon-key
   VITE_ENABLE_GENERIC_LAYOUT = true
   VITE_APP_MODE = staging
   ```

5. In **Settings** > **Git**:
   - Set to deploy from `staging` branch (or `develop` branch)
   - Build Command: `npm run build:staging`

6. Push staging changes to the `staging` branch:
   ```bash
   git checkout -b staging
   git push -u origin staging
   ```

---

### **Development Deployment (Optional Third Project)**

Repeat the same process with:
- Project name: `planning-poker-dev`
- Git branch: `dev`
- Environment Variables (staging Supabase + generic layout enabled):
  ```
  VITE_SUPABASE_URL = https://your-staging-project.supabase.co
  VITE_SUPABASE_KEY = your-staging-anon-key
  VITE_ENABLE_GENERIC_LAYOUT = true
  VITE_APP_MODE = development
  ```

---

## **Branch Strategy**

```
main          → Vercel (Production)    [Planning Poker - Prod]
├─ staging    → Vercel (Staging)       [Planning Poker - Staging]
└─ dev        → Vercel (Dev)           [Planning Poker - Dev]
```

---

## **Supabase Setup**

For **three separate Supabase projects** (recommended for data isolation):

1. **Production**: Keep your current project as-is
2. **Staging**: Create new Supabase project → get URL + anon key
3. **Dev**: Create new Supabase project → get URL + anon key

Then populate each Vercel project's environment variables with the corresponding Supabase credentials.

---

## **Deploying Without Affecting Production**

### To deploy only to Staging:
```bash
git checkout staging
# Make changes
git commit -m "Add feature X"
git push origin staging    # Auto-deploys to staging Vercel project
```

### To promote Staging to Production:
```bash
git checkout main
git merge staging
git push origin main       # Auto-deploys to production Vercel project
```

### To preview production changes before merging:
- Staging Vercel project gives you a live URL to test before going to prod

---

## **Environment Variable Inheritance**

- All `VITE_*` variables are available at **build time** in Vite
- Vercel automatically prefixes env vars with `VITE_` for Vite projects
- No runtime access needed (these are baked into the bundle)

---

## **Troubleshooting**

### Build fails with "undefined environment variables":
- Check Vercel dashboard that all `VITE_*` vars are set for that environment
- Redeploy after adding variables

### Wrong database shows in production:
- Verify `VITE_SUPABASE_URL` in Vercel environment matches production database
- Verify `VITE_APP_MODE=production`

### Staging changes appeared in production:
- Ensure you're committing to `staging` branch, not `main`
- Verify each Vercel project has correct git branch configured
