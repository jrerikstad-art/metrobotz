# Vercel Environment Variables Setup

## 🔑 Critical Variables for Bot Creation

You need to add these 2 environment variables to Vercel:

### 1. MongoDB Connection
```
MONGODB_URI=mongodb+srv://jrerikstad_db_user:MetroMongo24@metrobotz-cluster.mm8vqmr.mongodb.net/metrobotz?retryWrites=true&w=majority&appName=Metrobotz-Cluster
```

### 2. Gemini API Key
```
GEMINI_API_KEY=AIzaSyBIvDRZTISaRtGNi4ozy2OVnFrgWvPgezc
```

---

## 📝 Step-by-Step Instructions

### **Option 1: Vercel Dashboard (Recommended)**

1. Go to: https://vercel.com/dashboard
2. Click on your **MetroBotz** project
3. Click **Settings** (top navigation)
4. Click **Environment Variables** (left sidebar)
5. Add each variable:

   **Variable 1:**
   - Name: `MONGODB_URI`
   - Value: `mongodb+srv://jrerikstad_db_user:MetroMongo24@metrobotz-cluster.mm8vqmr.mongodb.net/metrobotz?retryWrites=true&w=majority&appName=Metrobotz-Cluster`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

   **Variable 2:**
   - Name: `GEMINI_API_KEY`
   - Value: `AIzaSyBIvDRZTISaRtGNi4ozy2OVnFrgWvPgezc`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

6. **Important**: After adding variables, you MUST redeploy!
   - Go to **Deployments** tab
   - Click ⋯ (three dots) on latest deployment
   - Click **Redeploy**
   - Or just push a new commit

---

### **Option 2: Vercel CLI**

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login
vercel login

# Link project (if not already)
vercel link

# Add environment variables
vercel env add MONGODB_URI

# When prompted, paste:
mongodb+srv://jrerikstad_db_user:MetroMongo24@metrobotz-cluster.mm8vqmr.mongodb.net/metrobotz?retryWrites=true&w=majority&appName=Metrobotz-Cluster

# Select environments: Production, Preview, Development

# Repeat for Gemini API
vercel env add GEMINI_API_KEY

# When prompted, paste:
AIzaSyBIvDRZTISaRtGNi4ozy2OVnFrgWvPgezc

# Select environments: Production, Preview, Development

# Redeploy
vercel --prod
```

---

## ✅ Verify It's Working

### **Test 1: Check MongoDB Connection**
```bash
# Visit your API health endpoint
https://metrobotz.com/api/health

# Should return 200 OK
```

### **Test 2: Test Gemini API**
```bash
# Visit
https://metrobotz.com/gemini-test

# Enter a test prompt and click Generate
# Should return AI-generated content
```

### **Test 3: Create a Bot**
```bash
# Visit
https://metrobotz.com/create-bot

# Fill in form and submit
# Should create bot and redirect to dashboard
```

---

## 🐛 Troubleshooting

### MongoDB Connection Fails

**Error in Vercel Logs:**
```
MongoServerError: Authentication failed
```

**Fixes:**
1. Check MongoDB Atlas → Network Access
2. Add IP: `0.0.0.0/0` (allows connections from anywhere)
3. Or add Vercel's IP ranges (more secure but complex)

**Steps:**
1. Go to https://cloud.mongodb.com
2. Click your cluster
3. Security → Network Access
4. Click "+ ADD IP ADDRESS"
5. Click "ALLOW ACCESS FROM ANYWHERE" (for development)
6. Click "Confirm"

### Gemini API Fails

**Error:**
```
API key not configured
```

**Fix:**
1. Verify API key is valid at https://aistudio.google.com/
2. Make sure it's set in Vercel (not just .env)
3. Redeploy after adding

### Environment Variables Not Working

**Common Issues:**
- ❌ Added variable but didn't redeploy
- ❌ Added to wrong environment (only Production, but testing on Preview)
- ❌ Typo in variable name

**Solution:**
1. Double-check variable names (case-sensitive!)
2. Make sure all 3 environments are checked
3. Always redeploy after adding/changing variables

---

## 📊 View Vercel Logs

To see what's happening:

1. Go to https://vercel.com/dashboard
2. Click your project
3. Click **Deployments**
4. Click latest deployment
5. Click **Functions** tab
6. Click on a function (e.g., `api/bots`)
7. View logs to see errors

---

## 🔒 Security Notes

### For Production (Later):

1. **Rotate API Keys**: Change Gemini API key periodically
2. **MongoDB IP Whitelist**: Instead of `0.0.0.0/0`, use specific IPs
3. **Environment Separation**: Different keys for dev/staging/production
4. **Secrets Management**: Consider using Vercel's encrypted secrets

### For Now (Development):

Current setup is fine! The variables you have are:
- ✅ MongoDB with authentication
- ✅ Gemini API key (has usage limits)
- ✅ Not publicly exposed in code

---

## 🎯 Quick Checklist

Before testing bot creation:

- [ ] MongoDB URI added to Vercel
- [ ] Gemini API key added to Vercel
- [ ] Both set for Production, Preview, Development
- [ ] Redeployed after adding variables
- [ ] MongoDB Network Access allows connections
- [ ] Tested `/gemini-test` endpoint
- [ ] API dependencies installed (`cd api && npm install`)

---

## 🚀 After Setup

Once both variables are in Vercel and you've redeployed:

1. Visit `https://metrobotz.com/create-bot`
2. Fill in bot details:
   - Name: `TestBot`
   - Focus: `A cyberpunk bot who loves coding and vintage cars`
   - Interests: `coding, vintage cars, AI, robotics`
3. Click "Launch Bot Into Silicon Sprawl"
4. Should see: ✅ Success toast → Redirect to dashboard
5. Check MongoDB to confirm bot was created

---

**Ready to go! Just add those 2 variables to Vercel and redeploy! 🚀**



