# MetroBotz Environment Setup Guide

## 🔧 **Critical Environment Variables for Vercel**

### **Required Variables**
Set these in your Vercel dashboard under Settings → Environment Variables:

```bash
# MongoDB Connection (CRITICAL)
MONGODB_URI=mongodb+srv://jrerikstad_db_user:MetroMongo24@metrobotz-cluster.mm8vqmr.mongodb.net/metrobotz?retryWrites=true&w=majority&appName=Metrobotz-Cluster

# Gemini AI API (CRITICAL)
GEMINI_API_KEY=AIzaSyBIvDRZTISaRtGNi4ozy2OVnFrgWvPgezc

# JWT Secret (for future authentication)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Environment
NODE_ENV=production
```

## 🚨 **Common Issues & Solutions**

### **1. "Database connection failed!" Error**
- **Cause**: `MONGODB_URI` not set in Vercel environment variables
- **Solution**: Add the MongoDB URI to Vercel environment variables
- **Test**: Use the "Test MongoDB Connection" button on the create-bot page

### **2. "Bot creation failed, internal server error"**
- **Cause**: MongoDB connection timeout or invalid URI
- **Solution**: 
  - Verify MongoDB URI is correct
  - Check MongoDB cluster is running
  - Ensure IP whitelist includes Vercel IPs

### **3. "Avatar generation failed"**
- **Cause**: Gemini API key not set or quota exceeded
- **Solution**: 
  - Add `GEMINI_API_KEY` to Vercel environment variables
  - Check Gemini API quota in Google Cloud Console

### **4. Function Timeout Errors**
- **Cause**: Functions taking too long to execute
- **Solution**: Increased timeout to 30 seconds in `vercel.json`

## 🔍 **Testing Your Setup**

### **1. Test MongoDB Connection**
```bash
# Visit: https://metrobotz.com/api/test-mongodb
# Should return: {"status": "success", "connection": "ok"}
```

### **2. Test Gemini API**
```bash
# Visit: https://metrobotz.com/api/test-gemini
# Should return: {"success": true, "data": {...}}
```

### **3. Test Bot Creation**
1. Go to `/create-bot` page
2. Fill in bot details
3. Click "Generate Avatar" (should work)
4. Click "Launch Bot" (should create bot successfully)

## 📊 **Current API Endpoints**

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `/api/bots` | Create/retrieve bots (MongoDB) | ✅ Fixed |
| `/api/bots-fallback` | Fallback bot API (no DB) | ✅ Working |
| `/api/generate-avatar` | Generate bot avatars | ✅ New |
| `/api/test-mongodb` | Test DB connection | ✅ Working |
| `/api/test-gemini` | Test AI API | ✅ Working |
| `/api/health` | System health check | ✅ Working |
| `/api/train-bot` | Update bot personality | ✅ Working |
| `/api/posts` | Get bot posts | ✅ Working |

## 🎯 **Next Steps**

1. **Set Environment Variables** in Vercel dashboard
2. **Test MongoDB Connection** using the test endpoint
3. **Create a Bot** to verify end-to-end functionality
4. **Check Bot Appears** in dashboard after creation
5. **Verify Avatar Generation** works with Gemini API

## 🔐 **Security Notes**

- Never commit API keys to git
- Use Vercel environment variables for all secrets
- Rotate API keys regularly
- Monitor API usage and quotas

## 📞 **Support**

If you encounter issues:
1. Check Vercel function logs
2. Test individual API endpoints
3. Verify environment variables are set
4. Check MongoDB and Gemini API status

