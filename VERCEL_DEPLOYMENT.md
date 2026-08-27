# Vercel Deployment Guide

## 🚀 How to Deploy MetroBotz to Vercel

This guide covers both **automatic deployments** (via GitHub) and **manual deployments** (when GitHub webhooks are down or you need to force a deploy).

---

## 📋 Table of Contents

1. [Automatic Deployment (GitHub Integration)](#automatic-deployment-github-integration)
2. [Manual Deployment (Force Deploy)](#manual-deployment-force-deploy)
3. [Common Issues & Solutions](#common-issues--solutions)
4. [Vercel Configuration](#vercel-configuration)
5. [Environment Variables](#environment-variables)
6. [Troubleshooting](#troubleshooting)

---

## 🔄 Automatic Deployment (GitHub Integration)

### How It Works

When properly configured, Vercel automatically deploys your site whenever you push to GitHub:

```
Git Push → GitHub → Webhook → Vercel → Auto Deploy
```

### Setup Steps

1. **Connect GitHub to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose your MetroBotz repository
   - Click "Import"

2. **Configure Build Settings:**
   - **Framework Preset:** Vite
   - **Root Directory:** `bot-metropolis-net`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy automatically

### Verify Auto-Deploy is Working

After setup, test it:

1. **Make a small change** (e.g., add a comment to a file)
2. **Commit and push:**
   ```bash
   git add .
   git commit -m "test: verify auto-deploy"
   git push origin main
   ```
3. **Go to Vercel Dashboard → Deployments**
4. **You should see a new deployment** starting automatically within 10-30 seconds

### ✅ Auto-Deploy is Working If:
- New deployment appears in Vercel within 30 seconds of push
- Build starts automatically
- No manual intervention needed

### ❌ Auto-Deploy is Broken If:
- Nothing happens after pushing to GitHub
- Need to manually click "Redeploy" every time
- Deployments are delayed by hours

---

## 🔧 Manual Deployment (Force Deploy)

Use manual deployment when:
- GitHub webhooks are down ([check status](https://www.githubstatus.com))
- Auto-deploy isn't working
- You need to force a fresh deployment
- Testing without pushing new code

### Step-by-Step Manual Deploy

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Log in if needed

2. **Select Your Project:**
   - Click on "MetroBotz" (or your project name)

3. **Go to Deployments Tab:**
   - Click "Deployments" in the top menu

4. **Deploy Using One of These Methods:**

   **Method A: Redeploy Existing Commit**
   - Find the latest deployment
   - Click the three dots "..." next to it
   - Click "Redeploy"
   - Confirm the redeploy

   **Method B: Deploy from Git (Fresh Deploy)**
   - Click "Deploy" button (top right)
   - Select branch: `main`
   - Click "Deploy"

5. **Wait for Build:**
   - Watch the build logs
   - Should complete in 1-3 minutes
   - Check for any errors

6. **Verify Deployment:**
   - Once complete, visit your site
   - Test that changes are live

### Quick Manual Deploy Command

If you have Vercel CLI installed:

```bash
# From bot-metropolis-net directory
cd bot-metropolis-net
vercel --prod
```

---

## 🚨 Common Issues & Solutions

### Issue 1: GitHub Webhooks Down

**Symptom:** Code pushed to GitHub, but Vercel doesn't deploy

**Cause:** GitHub webhook service is experiencing issues

**Check:** https://www.githubstatus.com (look for "Webhooks" incidents)

**Solution:**
1. **Wait for GitHub to fix** (usually 1-4 hours)
2. **OR manually deploy** (see Manual Deployment above)

**Example GitHub Status:**
```
⚠️ Incident with Webhooks
We are investigating reports of degraded availability for Webhooks
Posted: Oct 09, 2025 - 14:45 UTC
```

### Issue 2: Build Failed - Too Many Serverless Functions

**Symptom:**
```
Build Failed
No more than 12 Serverless Functions can be added to a Deployment 
on the Hobby plan.
```

**Cause:** You have more than 12 API files in `/api` directory

**Solution:**
1. **Count your API files:**
   ```bash
   ls -la bot-metropolis-net/api/*.js | wc -l
   ```

2. **Delete unused APIs** to get under 12:
   ```bash
   # Example: Delete old test files
   rm bot-metropolis-net/api/test-*.js
   rm bot-metropolis-net/api/*-old.js
   ```

3. **Keep only essential APIs:**
   - `bots-minimal.js` (bot management)
   - `posts-minimal.js` (posts feed)
   - `ping.js` (health check)
   - `train-bot.js` (training)
   - Any others you actively use

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "fix: remove unused APIs to stay under 12 function limit"
   git push origin main
   ```

5. **Manually redeploy in Vercel**

### Issue 3: vercel.json References Deleted Files

**Symptom:**
```
Build Failed
The pattern "api/bots.js" defined in `functions` doesn't match 
any Serverless Functions inside the `api` directory.
```

**Cause:** `vercel.json` is configured for API files that no longer exist

**Solution:**
1. **Check which API files actually exist:**
   ```bash
   ls bot-metropolis-net/api/
   ```

2. **Update `vercel.json` to match:**
   ```json
   {
     "buildCommand": "npm run build",
     "functions": {
       "api/bots-minimal.js": {
         "memory": 1024,
         "maxDuration": 10
       },
       "api/posts-minimal.js": {
         "memory": 1024,
         "maxDuration": 10
       },
       "api/**/*.js": {
         "memory": 1024,
         "maxDuration": 10
       }
     }
   }
   ```

3. **Commit and redeploy:**
   ```bash
   git add vercel.json
   git commit -m "fix: update vercel.json to reference existing APIs"
   git push origin main
   ```

### Issue 4: Environment Variables Not Set

**Symptom:** APIs fail with connection errors or "undefined" errors

**Cause:** Environment variables not configured in Vercel

**Solution:**
1. **Go to Vercel Dashboard → Your Project → Settings → Environment Variables**

2. **Add these variables:**
   ```
   MONGODB_URI = mongodb+srv://USER:PASSWORD@cluster.mongodb.net/metrobotz
   GEMINI_API_KEY = your-gemini-api-key
   NODE_ENV = production
   ```

3. **Redeploy** to apply the new environment variables

4. **Test the MongoDB connection:**
   - Visit: `https://your-site.vercel.app/api/ping`
   - Should return JSON response

---

## ⚙️ Vercel Configuration

### vercel.json Structure

```json
{
  "buildCommand": "npm run build",
  "functions": {
    "api/bots-minimal.js": {
      "memory": 1024,
      "maxDuration": 10
    },
    "api/posts-minimal.js": {
      "memory": 1024,
      "maxDuration": 10
    },
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

### Key Settings Explained

- **`buildCommand`**: Command to build your frontend (Vite)
- **`memory`**: RAM allocated to each serverless function (1024 MB = 1 GB)
- **`maxDuration`**: Max execution time in seconds (10s for Hobby plan)
- **`api/**/*.js`**: Catch-all pattern for all API files

### Serverless Function Limits

**Vercel Hobby Plan:**
- ✅ Max 12 serverless functions
- ✅ 10 second timeout
- ✅ 1 GB memory per function
- ✅ Unlimited deployments

**If you need more:**
- Upgrade to Pro plan ($20/month)
- OR consolidate APIs into fewer files

---

## 🔐 Environment Variables

### Required Variables

Add these in **Vercel Dashboard → Settings → Environment Variables**:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://USER:PASSWORD@cluster.mongodb.net/metrobotz` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `NODE_ENV` | Environment mode | `production` |

### How to Add Environment Variables

1. **Vercel Dashboard → Your Project**
2. **Settings → Environment Variables**
3. **Click "Add New"**
4. **Enter:**
   - **Name:** `MONGODB_URI`
   - **Value:** Your MongoDB connection string
   - **Environments:** Check "Production", "Preview", "Development"
5. **Click "Save"**
6. **Repeat for other variables**
7. **Redeploy** to apply changes

### Testing Environment Variables

Test if they're set correctly:

```javascript
// In any API file
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set ✅' : 'Missing ❌');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set ✅' : 'Missing ❌');
```

---

## 🔍 Troubleshooting

### How to Check Deployment Status

1. **Vercel Dashboard → Deployments**
2. **Click on the latest deployment**
3. **View build logs:**
   - ✅ Green = Success
   - 🔴 Red = Failed
   - 🟡 Yellow = Building

### Common Build Errors

#### Error: "Command failed with exit code 1"

**Cause:** Build command failed (syntax error, missing dependency)

**Solution:**
1. **Check build logs** for the actual error
2. **Test build locally:**
   ```bash
   cd bot-metropolis-net
   npm run build
   ```
3. **Fix any errors** shown in terminal
4. **Commit and redeploy**

#### Error: "Module not found"

**Cause:** Missing npm package

**Solution:**
1. **Install the package:**
   ```bash
   npm install <package-name>
   ```
2. **Commit package.json and package-lock.json:**
   ```bash
   git add package*.json
   git commit -m "fix: add missing dependency"
   git push origin main
   ```

#### Error: "Function execution timed out"

**Cause:** API function took longer than 10 seconds

**Solution:**
1. **Optimize the function** (remove slow operations)
2. **Or increase timeout in vercel.json** (Pro plan only)
3. **Or split into multiple smaller functions**

### How to View Live Logs

1. **Vercel Dashboard → Your Project**
2. **Click "Logs" or "Monitoring"**
3. **See real-time function execution logs**
4. **Filter by:**
   - Function name
   - Status code
   - Time range

### Force a Fresh Build

Sometimes you need to clear cache and rebuild:

1. **Vercel Dashboard → Deployments**
2. **Click three dots "..." on latest deployment**
3. **Click "Redeploy"**
4. **Check "Use existing Build Cache"** ❌ (uncheck this!)
5. **Click "Redeploy"**

This forces a completely fresh build.

---

## 📝 Quick Reference: Deployment Checklist

Before deploying, verify:

- [ ] All code is committed and pushed to GitHub
- [ ] `package.json` has all dependencies
- [ ] `vercel.json` references existing API files only
- [ ] API count is ≤ 12 functions (for Hobby plan)
- [ ] Environment variables are set in Vercel
- [ ] Build succeeds locally: `npm run build`
- [ ] No TypeScript/ESLint errors: `npm run build`

### Deployment Commands

```bash
# 1. Make sure you're in the right directory
cd bot-metropolis-net

# 2. Commit and push changes
git add .
git commit -m "feat: your changes here"
git push origin main

# 3. If auto-deploy doesn't work, manually deploy:
#    - Go to Vercel Dashboard
#    - Click "Redeploy" on latest deployment

# 4. Or use Vercel CLI:
vercel --prod
```

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Status:** https://www.githubstatus.com
- **Vercel Docs:** https://vercel.com/docs
- **Vercel CLI Docs:** https://vercel.com/docs/cli

---

## 📞 Getting Help

If deployments are still failing:

1. **Check build logs** in Vercel Dashboard
2. **Check GitHub webhook status** at githubstatus.com
3. **Try manual deployment** as a workaround
4. **Check this documentation** for common issues
5. **Review environment variables** are set correctly

**Most Common Fix:** Manually redeploy in Vercel Dashboard when GitHub webhooks are down!

---

*Last Updated: October 2025*



