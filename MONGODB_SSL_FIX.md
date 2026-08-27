# MongoDB SSL Alert Number 80 - FIX GUIDE

## 🚨 Error: "SSL alert number 80"

**Error Message:**
```
MongoServerSelectionError: SSL routines:ssl3_read_bytes:tlsv1 alert internal error
SSL alert number 80
```

This is a **TLS/SSL handshake error** between Vercel serverless functions and MongoDB Atlas.

---

## ✅ SOLUTION 1: Fix MongoDB Atlas Network Access (MOST COMMON)

### **The Problem:**
MongoDB Atlas is blocking Vercel's IP addresses.

### **The Fix:**

1. **Go to MongoDB Atlas Dashboard:**
   - Visit: https://cloud.mongodb.com
   - Log in to your account

2. **Select Your Cluster:**
   - Click on your MetroBotz cluster

3. **Go to Network Access:**
   - Click "Network Access" in the left sidebar
   - Or: Security → Network Access

4. **Add Vercel IP Address:**
   
   **Option A: Allow All IPs (Easiest)**
   - Click "+ ADD IP ADDRESS"
   - Click "ALLOW ACCESS FROM ANYWHERE"
   - IP Address: `0.0.0.0/0`
   - Description: "Vercel Access"
   - Click "Confirm"

   **Option B: Vercel-Specific IPs (More Secure)**
   - Vercel uses dynamic IPs, so Option A is recommended
   - Alternatively, whitelist your Vercel deployment IPs

5. **Wait 1-2 Minutes:**
   - Changes take effect immediately but may need propagation time

6. **Test Again:**
   - Try creating a bot
   - Check `/api/health` endpoint

---

## ✅ SOLUTION 2: Update MongoDB Connection String

### **The Problem:**
Connection string might be missing required parameters.

### **The Fix:**

1. **Get New Connection String from MongoDB Atlas:**
   - MongoDB Atlas → Clusters → Connect
   - Choose "Connect your application"
   - Driver: Node.js
   - Version: 5.5 or later
   - Copy the connection string

2. **Ensure Connection String Has These Parameters:**
   ```
   mongodb+srv://USER:PASSWORD@cluster.mongodb.net/metrobotz
   ```

3. **Update in Vercel:**
   - Vercel Dashboard → Your Project → Settings → Environment Variables
   - Update `MONGODB_URI` with the new connection string
   - Redeploy

---

## ✅ SOLUTION 3: Update _db.js Configuration (ALREADY APPLIED)

### **What Was Changed:**

Updated `api/_db.js` with optimized settings for Vercel + MongoDB Atlas:

```javascript
const client = new MongoClient(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // Increased timeout
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  maxPoolSize: 1, // Reduced for serverless
  minPoolSize: 0,
  maxIdleTimeMS: 10000,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
  directConnection: false, // Important for replica sets
  ssl: true, // Explicit SSL
  sslValidate: true,
});
```

**Key Changes:**
- ✅ Increased timeouts to 30 seconds
- ✅ Reduced pool size for serverless (1 connection)
- ✅ Explicit SSL settings
- ✅ `directConnection: false` for replica sets
- ✅ Retry logic enabled

---

## 🔍 TROUBLESHOOTING STEPS

### **Step 1: Check Network Access**
1. MongoDB Atlas → Network Access
2. Look for `0.0.0.0/0` in the IP Access List
3. Status should be "Active" (green)

### **Step 2: Check Database User**
1. MongoDB Atlas → Database Access
2. Find your database user
3. Password should be correct
4. User should have "Read and write to any database" role

### **Step 3: Check Connection String**
1. Connection string should start with `mongodb+srv://`
2. Should NOT use `mongodb://` (old format)
3. Should include database name: `...mongodb.net/metrobotz?...`

### **Step 4: Check Vercel Environment Variables**
1. Vercel Dashboard → Settings → Environment Variables
2. `MONGODB_URI` should be set
3. Value should match the Atlas connection string
4. Should be enabled for "Production", "Preview", "Development"

### **Step 5: Test Connection**
1. Visit: https://www.metrobotz.com/api/health
2. Check response:
   - `"hasMongoUri": true` ✅
   - `"connected": true` ✅
   - If false, connection is still failing

---

## 📝 COMMON MISTAKES

### ❌ Wrong: Using IP Whitelist for Specific IPs
- Vercel IPs change frequently
- Serverless functions use different IPs

### ✅ Right: Allow All IPs (0.0.0.0/0)
- Works reliably with Vercel
- MongoDB Atlas still requires authentication
- Safe when using strong passwords

### ❌ Wrong: Old Connection String Format
```
mongodb://username:password@host:27017/database
```

### ✅ Right: SRV Connection String
```
mongodb+srv://USER:PASSWORD@cluster.mongodb.net/metrobotz
```

---

## 🎯 IMMEDIATE ACTION REQUIRED

### **Most Likely Fix (Do This First):**

1. **Go to MongoDB Atlas:**
   https://cloud.mongodb.com

2. **Network Access → ADD IP ADDRESS**
   - IP: `0.0.0.0/0`
   - Description: "Allow Vercel Access"

3. **Wait 2 minutes**

4. **Test Bot Creation:**
   - Try creating a bot again
   - Should work now!

### **If Still Failing:**

1. **Check Vercel Logs:**
   - Vercel Dashboard → Deployments → Latest → Functions
   - Look for MongoDB errors

2. **Check Connection String:**
   - Make sure it's `mongodb+srv://` (with SRV)
   - Make sure database name is included

3. **Verify Password:**
   - MongoDB Atlas → Database Access
   - Reset password if unsure
   - Update `MONGODB_URI` in Vercel

---

## 🔗 Helpful Links

- **MongoDB Atlas:** https://cloud.mongodb.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Health Check:** https://www.metrobotz.com/api/health

---

*This fix resolves the "SSL alert number 80" error caused by MongoDB Atlas rejecting Vercel's connection attempts.*



