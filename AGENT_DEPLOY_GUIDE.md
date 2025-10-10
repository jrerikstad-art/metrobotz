# 🤖 AGENT DEPLOYMENT GUIDE - MetroBotz

## ⚠️ CRITICAL: AUTO-DEPLOY DOES NOT WORK RELIABLY

**READ THIS FIRST:** Vercel's automatic GitHub deployment is **UNRELIABLE** for this project. You **MUST** use manual deployment.

---

## 🎯 HOW TO DEPLOY (STEP-BY-STEP)

### ✅ THE ONLY RELIABLE METHOD: Manual Deploy in Vercel Dashboard

After you push code to GitHub, you **MUST** manually trigger deployment:

#### **Step 1: Push Your Code to GitHub**

```bash
# Navigate to project directory
cd bot-metropolis-net

# Stage all changes
git add .

# Commit with a message
git commit -m "your commit message here"

# Push to GitHub
git push origin main
```

✅ Verify the push succeeded - you should see "Writing objects: 100%" in the output.

#### **Step 2: Manually Deploy in Vercel (REQUIRED)**

**DO NOT WAIT** for auto-deploy. It will NOT work. Follow these steps:

1. **Open Vercel Dashboard:**
   - Go to: https://vercel.com/dashboard
   - Log in if needed

2. **Click on the MetroBotz Project:**
   - Look for "bot-metropolis-net" or "MetroBotz"
   - Click on it

3. **Go to Deployments Tab:**
   - Click "Deployments" in the top navigation

4. **Trigger Manual Deployment:**
   
   **Method A - Redeploy Latest (FASTEST):**
   - Find the most recent deployment in the list
   - Click the three dots "⋯" on the right side
   - Click "Redeploy"
   - Click "Redeploy" again to confirm
   
   **Method B - Deploy from Git:**
   - Click "Deploy" button (top right corner)
   - Select branch: `main`
   - Click "Deploy"

5. **Wait for Build to Complete:**
   - Build takes 1-3 minutes
   - Watch for ✅ green checkmark (success) or 🔴 red X (failed)
   - If failed, click on the deployment to see error logs

6. **Verify Changes Are Live:**
   - Click "Visit" button to open the site
   - Check that your changes are visible
   - Test functionality

---

## 🚨 COMMON ERRORS & FIXES

### Error 1: "No more than 12 Serverless Functions"

**Error Message:**
```
Build Failed
No more than 12 Serverless Functions can be added to a Deployment 
on the Hobby plan.
```

**What This Means:**
You have too many `.js` files in the `/api` directory. Vercel Hobby plan allows max 12.

**How to Fix:**

1. **Count API files:**
   ```bash
   ls api/*.js
   ```

2. **Delete unnecessary API files** (keep only these essential ones):
   - ✅ `bots-minimal.js` (bot creation/retrieval)
   - ✅ `posts-minimal.js` (posts feed)
   - ✅ `ping.js` (health check)
   - ✅ `train-bot.js` (bot training)
   - ❌ Delete any `test-*.js` files
   - ❌ Delete any `*-old.js` files
   - ❌ Delete any duplicate or unused files

3. **Example deletion commands:**
   ```bash
   # Delete test files
   rm api/test-*.js
   
   # Delete old/backup files
   rm api/*-old.js
   rm api/*-backup.js
   ```

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "fix: remove unused APIs to stay under 12 function limit"
   git push origin main
   ```

5. **Manually redeploy in Vercel** (see steps above)

---

### Error 2: "Pattern doesn't match any Serverless Functions"

**Error Message:**
```
Build Failed
The pattern "api/bots.js" defined in `functions` doesn't match 
any Serverless Functions inside the `api` directory.
```

**What This Means:**
The `vercel.json` file references API files that don't exist (were deleted).

**How to Fix:**

1. **Check which API files actually exist:**
   ```bash
   ls api/
   ```

2. **Open `vercel.json` and update it to match existing files:**
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

3. **Remove any specific references to deleted files**

4. **Commit and push:**
   ```bash
   git add vercel.json
   git commit -m "fix: update vercel.json to reference existing APIs"
   git push origin main
   ```

5. **Manually redeploy in Vercel** (see steps above)

---

### Error 3: "Command failed with exit code 1"

**Error Message:**
```
Build Failed
Command "npm run build" exited with 1
```

**What This Means:**
There's a TypeScript, ESLint, or build error in your code.

**How to Fix:**

1. **Read the build logs in Vercel:**
   - Click on the failed deployment
   - Scroll through the logs to find the actual error
   - Look for messages like:
     - "error TS2322: Type 'X' is not assignable to type 'Y'"
     - "Module not found: Error: Can't resolve 'X'"
     - "'X' is not exported by 'Y'"

2. **Test build locally:**
   ```bash
   cd bot-metropolis-net
   npm run build
   ```

3. **Common issues:**
   
   **a) Missing import:**
   - Error: `'Gear' is not exported by 'lucide-react'`
   - Fix: Change `Gear` to `Settings` or another valid icon
   
   **b) Wrong import path:**
   - Error: `Cannot find module '@/components/X'`
   - Fix: Verify the component exists and path is correct
   
   **c) TypeScript type error:**
   - Error: `Type 'string | undefined' is not assignable to type 'string'`
   - Fix: Add type guards or use optional chaining

4. **Fix the error in your code**

5. **Commit and push:**
   ```bash
   git add .
   git commit -m "fix: resolve build error"
   git push origin main
   ```

6. **Manually redeploy in Vercel** (see steps above)

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before you commit and push, verify:

- [ ] **Code builds locally:** Run `npm run build` - should succeed
- [ ] **No TypeScript errors:** Check output of build command
- [ ] **API count ≤ 12:** Run `ls api/*.js | wc -l` (or count manually)
- [ ] **vercel.json is correct:** References only existing API files
- [ ] **Changes are staged:** Run `git status` to verify
- [ ] **Meaningful commit message:** Describes what you changed

---

## 🔍 TROUBLESHOOTING

### How to Check if Push Succeeded

After `git push origin main`, you should see:
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Writing objects: 100% (X/X), X.XX KiB | X.XX MiB/s, done.
To https://github.com/jrerikstad-art/metrobotz.git
   abc1234..def5678  main -> main
```

✅ **Success indicators:**
- "Writing objects: 100%"
- Shows old commit → new commit (abc1234..def5678)
- No error messages

❌ **Failure indicators:**
- "error: failed to push"
- "rejected"
- "non-fast-forward"

### How to Check if Deployment Succeeded

1. **In Vercel Dashboard → Deployments:**
   - ✅ Green checkmark = Success
   - 🔴 Red X = Failed (click to see logs)
   - 🟡 Building = Wait for it to finish

2. **Visit the site:**
   - Click "Visit" button in Vercel
   - Verify your changes are visible
   - Test functionality

3. **Check deployment URL:**
   - Production: `https://www.metrobotz.com`
   - Latest: Check the URL in Vercel deployment

---

## ⚙️ CURRENT PROJECT CONFIGURATION

### API Files (Must be ≤ 12)

**Currently Active APIs:**
1. `api/bots-minimal.js` - Bot creation/retrieval (NO MongoDB, uses in-memory storage)
2. `api/posts-minimal.js` - Posts feed (NO MongoDB, returns empty array)
3. `api/ping.js` - Simple health check (no dependencies)
4. `api/train-bot.js` - Bot training endpoint

**Total: 4 APIs** ✅ (well under 12 limit)

### Environment Variables

These are set in Vercel Dashboard → Settings → Environment Variables:

- `MONGODB_URI` - MongoDB connection string (currently NOT USED by minimal APIs)
- `GEMINI_API_KEY` - Google Gemini API key
- `NODE_ENV` - Set to `production`

### Build Configuration

- **Framework:** Vite
- **Root Directory:** `bot-metropolis-net`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node Version:** 18.x

---

## 🔗 QUICK LINKS

- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repository:** https://github.com/jrerikstad-art/metrobotz
- **Live Site:** https://www.metrobotz.com
- **GitHub Status (check webhooks):** https://www.githubstatus.com

---

## 💡 WHY AUTO-DEPLOY DOESN'T WORK

### Technical Reasons:

1. **GitHub Webhooks are Unreliable:**
   - Frequent outages/degraded performance
   - Can be delayed by hours
   - No guarantee of delivery

2. **Vercel-GitHub Integration Issues:**
   - Sometimes webhooks get disconnected
   - Cache issues prevent new deployments
   - Silent failures (no error, just no deploy)

3. **User Preference:**
   - User explicitly wants control over deployments
   - Prefers manual verification before going live
   - Avoids unexpected production changes

### The Solution:

**ALWAYS manually deploy in Vercel Dashboard after pushing to GitHub.**

This ensures:
- ✅ Changes are actually deployed
- ✅ You see the build logs immediately
- ✅ You can verify success before continuing
- ✅ No waiting/wondering if auto-deploy will trigger

---

## 📝 EXAMPLE DEPLOYMENT WORKFLOW

Here's a complete example of deploying a change:

```bash
# 1. Make your changes to the code
# (edit files, add features, fix bugs)

# 2. Test locally
cd bot-metropolis-net
npm run build    # Should succeed

# 3. Stage changes
git add .

# 4. Commit with descriptive message
git commit -m "feat: add personality sliders to dashboard"

# 5. Push to GitHub
git push origin main

# 6. MANUALLY DEPLOY IN VERCEL:
#    a) Open: https://vercel.com/dashboard
#    b) Click: MetroBotz project
#    c) Click: Deployments tab
#    d) Click: "..." next to latest deployment
#    e) Click: Redeploy
#    f) Click: Redeploy (confirm)
#    g) Wait: 1-3 minutes for build
#    h) Click: Visit (verify changes)

# 7. Done! Changes are live
```

---

## ⚠️ IMPORTANT REMINDERS FOR AGENTS

1. **NEVER assume auto-deploy works** - it doesn't!

2. **ALWAYS manually deploy** after pushing to GitHub

3. **ALWAYS check build logs** in Vercel Dashboard

4. **If build fails**, read the error message and fix it

5. **Keep API count ≤ 12** (Hobby plan limit)

6. **Update vercel.json** if you add/remove API files

7. **Test locally first** with `npm run build`

8. **Tell the user** when deployment is complete and verified

---

## 🎯 REMEMBER: Push Code → Manually Deploy → Verify!

**DO NOT** wait for auto-deploy. **DO** manually trigger deployment in Vercel Dashboard.

This is the **ONLY** reliable way to deploy MetroBotz.

---

*Last Updated: October 2025*

