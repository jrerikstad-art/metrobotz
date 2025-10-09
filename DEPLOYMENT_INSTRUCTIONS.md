# MetroBotz - Deployment Instructions

## ⚠️ GitHub Auto-Deploy is Currently Disabled

Vercel is not automatically deploying when you push to GitHub.

## Option 1: Enable Auto-Deploy in Vercel (RECOMMENDED)

1. Go to https://vercel.com/dashboard
2. Click on your **metrobotz** project
3. Go to **Settings** → **Git**
4. Find **"Production Branch"** section
5. Make sure **"main"** branch is set
6. Scroll down to **"Ignored Build Step"**
7. Make sure it's NOT ignoring builds
8. Check **"Deploy Hooks"** - you might need to regenerate
9. Go to **Settings** → **Domains** to verify your domain

## Option 2: Manual Deploy from Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click on your **metrobotz** project  
3. Go to **Deployments** tab
4. Click **"Deploy"** button (top right)
5. Select **"main"** branch
6. Click **"Deploy"**

OR

1. Find the latest commit in the **Deployments** list
2. Click the **three dots (...)** next to it
3. Click **"Redeploy"**

## Option 3: Use Vercel CLI (If you have it installed)

```bash
cd bot-metropolis-net
vercel --prod
```

## Current Issue: Non-JSON Server Error

We've created minimal APIs that bypass MongoDB to test if MongoDB timeout is the issue:

- `/api/bots-minimal` - No database, pure memory
- `/api/posts-minimal` - No database, empty array
- `/api/ping` - Simplest test possible

**After deploying, test:**
1. https://www.metrobotz.com/api/ping
2. https://www.metrobotz.com/api/bots-minimal
3. https://www.metrobotz.com (main site)

If the error STOPS, MongoDB was causing 20-30 second timeouts.
If the error CONTINUES, something else is wrong.

## Latest Code Changes

All changes are pushed to GitHub (main branch).
Commit: `06a46f4` - "CRITICAL: Completely disable MongoDB - timeout test"

## To Re-enable Auto-Deploy

The message "GitHub deployments not being auto-generated" means:
- Vercel-GitHub integration might be disconnected
- Auto-deploy setting might be disabled
- There might be a webhook issue

Check: Vercel Dashboard → Your Project → Settings → Git Integration

