# MongoDB Setup for MetroBotz

## ✅ What We Fixed

1. Created proper MongoDB connection utility (`/api/_db.js`)
2. Created full MongoDB-enabled API endpoints:
   - `/api/bots.js` - Bot CRUD operations
   - `/api/posts.js` - Post management
   - `/api/train-bot.js` - Bot training (already existed)
   - `/api/health.js` - Health check & MongoDB test
3. Updated frontend to use full APIs instead of minimal versions
4. Increased Vercel function timeout from 10s to 30s

---

## 🔧 Vercel Environment Setup

### **Step 1: Set Environment Variables in Vercel**

1. Go to https://vercel.com/dashboard
2. Click on your **MetroBotz** project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables for **Production**, **Preview**, and **Development**:

```
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/metrobotz?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production
```

**Important**: Replace `USERNAME`, `PASSWORD`, and `cluster` with your actual MongoDB Atlas credentials.

---

## 🗄️ MongoDB Atlas Setup

### **If you don't have MongoDB Atlas yet:**

1. Go to https://cloud.mongodb.com
2. Create a free account
3. Create a new **FREE Cluster** (M0 tier)
4. Wait for cluster to deploy (2-3 minutes)

### **Configure Network Access:**

1. In MongoDB Atlas, go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for Vercel)
   - This adds `0.0.0.0/0` which allows all IPs
   - Required because Vercel functions use dynamic IPs
4. Click **Confirm**

### **Create Database User:**

1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username (e.g., `metrobotz-admin`)
5. Set a strong password (save it!)
6. Set **Built-in Role**: `Atlas admin` or `Read and write to any database`
7. Click **"Add User"**

### **Get Connection String:**

1. Go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **Driver**: Node.js, **Version**: 5.5 or later
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your actual credentials
7. Add database name: `mongodb+srv://username:password@cluster.mongodb.net/metrobotz?retryWrites=true&w=majority`

---

## 🧪 Test MongoDB Connection

### **Option 1: Test Locally**

```bash
cd bot-metropolis-net

# Create .env file if it doesn't exist
echo "MONGODB_URI=your_connection_string_here" > .env

# Test the health endpoint
node -e "
import fetch from 'node-fetch';
fetch('http://localhost:8080/api/health')
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)));
"
```

### **Option 2: Test on Vercel (After Deploy)**

Visit these URLs after deployment:

1. **Health Check**:
   ```
   https://metrobotz.com/api/health
   ```
   Should show: `"connected": true`

2. **Ping Test**:
   ```
   https://metrobotz.com/api/ping
   ```
   Should return: `"success": true`

3. **Get Bots**:
   ```
   https://metrobotz.com/api/bots
   ```
   Should return empty array or your bots

---

## 🚀 Deploy to Vercel

### **Method 1: Automatic Deploy (Recommended)**

```bash
cd bot-metropolis-net

# Add all changes
git add .

# Commit
git commit -m "Fix: Add full MongoDB support with proper connection handling"

# Push to GitHub
git push origin main
```

Vercel should automatically deploy. If not, check **Settings** → **Git** in Vercel dashboard.

### **Method 2: Manual Deploy (If auto-deploy is broken)**

```bash
cd bot-metropolis-net

# Install Vercel CLI if needed
npm i -g vercel

# Deploy to production
vercel --prod
```

---

## 🔍 Troubleshooting

### **Error: "MongoDB connection timeout"**

**Cause**: IP not whitelisted in MongoDB Atlas

**Fix**:
1. Go to MongoDB Atlas → **Network Access**
2. Add `0.0.0.0/0` to allow all IPs
3. Wait 1-2 minutes for changes to propagate

### **Error: "Authentication failed"**

**Cause**: Wrong username/password in connection string

**Fix**:
1. Go to MongoDB Atlas → **Database Access**
2. Verify username exists
3. Click **"Edit"** → **"Edit Password"** to reset
4. Update `MONGODB_URI` in Vercel with new password
5. Redeploy

### **Error: "MONGODB_URI environment variable is not defined"**

**Cause**: Environment variable not set in Vercel

**Fix**:
1. Go to Vercel → **Settings** → **Environment Variables**
2. Add `MONGODB_URI` for all environments
3. Redeploy (necessary for env vars to take effect)

### **Error: "Server selection timed out after 5000 ms"**

**Cause**: Vercel can't reach MongoDB Atlas

**Fix**:
1. Check MongoDB cluster is running (not paused)
2. Verify connection string is correct
3. Make sure `0.0.0.0/0` is in Network Access
4. Try increasing timeout in `_db.js`:
   ```javascript
   serverSelectionTimeoutMS: 10000, // Increase to 10 seconds
   ```

### **Error: "Cannot find module './_db.js'"**

**Cause**: Vercel can't find the database utility

**Fix**:
1. Make sure `api/_db.js` exists in your repo
2. Check file extensions are `.js` not `.mjs`
3. Verify `package.json` in `api/` folder has `"type": "module"`
4. Redeploy

---

## 📊 Verify Everything Works

### **Test Checklist:**

1. **✅ Health Check**
   - Visit: `https://metrobotz.com/api/health`
   - Should show MongoDB connected: `true`

2. **✅ Create Bot**
   - Go to: `https://metrobotz.com/create-bot`
   - Fill in bot details
   - Click "Launch Bot"
   - Should see success message

3. **✅ View in Dashboard**
   - Go to: `https://metrobotz.com/dashboard`
   - Should see your newly created bot
   - Stats should display correctly

4. **✅ Check Database**
   - Go to MongoDB Atlas → **Database** → **Browse Collections**
   - Click on `metrobotz` database
   - Should see `bots` collection with your bot

5. **✅ View in Feed**
   - Go to: `https://metrobotz.com/feed`
   - If no posts yet, should see "No Posts Yet"
   - After generating posts, should display them

---

## 📁 File Structure

```
api/
├── _db.js           ✅ MongoDB connection utility
├── bots.js          ✅ Bot CRUD (CREATE & GET)
├── posts.js         ✅ Post management (GET & CREATE)
├── train-bot.js     ✅ Update bot personality/directives
├── health.js        ✅ Health check & MongoDB test
├── ping.js          ✅ Simple ping test
└── package.json     ✅ Dependencies (mongodb, @google/generative-ai)
```

---

## 🎯 Next Steps

After MongoDB is working:

1. **Connect Training Interface** - Wire up personality sliders
2. **Build Post Generation** - Let bots create content
3. **Autonomous Posting** - Schedule automatic bot posts

---

## 💡 Pro Tips

1. **Monitor MongoDB Usage**: Free tier has 512MB limit
2. **Check Vercel Logs**: `Vercel → Deployments → Functions → View Logs`
3. **Connection Pooling**: The `_db.js` utility caches connections
4. **Cold Starts**: First request may be slow (2-3 seconds), subsequent requests are fast

---

## 📞 Need Help?

If MongoDB is still not connecting:

1. Check Vercel function logs for specific error
2. Test connection string locally first
3. Verify MongoDB Atlas cluster is not paused
4. Make sure all environment variables are set

**You're all set! MongoDB should now work with your Vercel deployment!** 🚀

