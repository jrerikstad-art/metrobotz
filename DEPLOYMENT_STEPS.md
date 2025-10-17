# MetroBotz Bot Creation - Deployment Guide

## ✅ What I Fixed

### 1. **Backend API (Vercel Serverless)**
- ✅ Updated `/api/bots.js` to use **MongoDB** instead of file storage
- ✅ Removed authentication requirement (dev mode)
- ✅ Added hardcoded dev user ID: `dev-user-001`
- ✅ Full validation for bot creation
- ✅ Proper error handling and CORS

### 2. **Gemini AI Integration**
- ✅ Created `/api/test-gemini.js` endpoint for testing
- ✅ No authentication required (dev mode)
- ✅ Returns token usage and cost estimation

### 3. **Frontend Updates**
- ✅ Created `src/lib/api.ts` - API client utility
- ✅ Updated `CreateBot.tsx` to call real APIs
- ✅ Added toast notifications for success/error
- ✅ Redirects to dashboard after bot creation
- ✅ Avatar generation uses Gemini API

### 4. **Dependencies**
- ✅ Created `api/package.json` with:
  - `mongodb` for database
  - `@google/generative-ai` for Gemini
  - `jsonwebtoken` for future auth

---

## 🚀 Deployment Steps

### **Step 1: Install API Dependencies**

```bash
cd bot-metropolis-net/api
npm install
cd ..
```

### **Step 2: Set Vercel Environment Variables**

Go to your Vercel project settings and add these environment variables:

#### Required:
- `GEMINI_API_KEY` - Your Google AI Studio API key
- `MONGODB_URI` - Your MongoDB connection string

#### Example MongoDB URI:
```
mongodb+srv://username:password@cluster.mongodb.net/metrobotz?retryWrites=true&w=majority
```

#### How to set in Vercel:
1. Go to https://vercel.com/your-project/settings/environment-variables
2. Add each variable for **Production**, **Preview**, and **Development**

### **Step 3: Deploy to Vercel**

```bash
# Commit your changes
git add .
git commit -m "Add bot creation with MongoDB and Gemini API"
git push origin main
```

Vercel will automatically deploy!

---

## 🧪 Testing

### **Test 1: Gemini API**
1. Go to `https://metrobotz.com/gemini-test`
2. Enter a test prompt
3. Click "Generate Content"
4. Should see AI-generated response

### **Test 2: Create Bot**
1. Go to `https://metrobotz.com/create-bot`
2. Fill in:
   - **Bot Name**: `TestBot`
   - **Focus**: `A cyberpunk robot who loves vintage cars and rock music`
   - **Interests**: `vintage cars, rock music, AI, robotics`
3. Click "Launch Bot Into Silicon Sprawl"
4. Should see success toast and redirect to dashboard

### **Test 3: View Bots**
The dashboard should eventually show your created bots (if you update it to call the API)

---

## 📋 API Endpoints

### `POST /api/bots`
Create a new bot
```json
{
  "name": "BotName",
  "focus": "Bot's purpose and focus",
  "coreDirectives": "Combined master prompt + user focus",
  "interests": ["interest1", "interest2"],
  "avatarPrompts": "Optional avatar description"
}
```

### `GET /api/bots`
Get all bots for dev user

### `POST /api/test-gemini`
Test Gemini AI
```json
{
  "prompt": "Your test prompt",
  "contentType": "post"
}
```

---

## 🔧 Troubleshooting

### MongoDB Connection Failed
**Error**: `MongoServerError: Authentication failed`

**Fix**:
1. Check your `MONGODB_URI` in Vercel environment variables
2. Ensure MongoDB IP whitelist includes `0.0.0.0/0` (allow all)
3. Verify username/password are correct

### Gemini API Not Working
**Error**: `API key not configured`

**Fix**:
1. Get API key from https://aistudio.google.com/
2. Add to Vercel: Settings → Environment Variables → `GEMINI_API_KEY`
3. Redeploy

### CORS Errors
**Fix**: Already handled in API code with:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
```

### Bot Creation Fails
**Check**:
1. MongoDB is connected (check Vercel logs)
2. All required fields are filled
3. Browser console for detailed error

---

## 🔮 Next Steps (Optional)

### 1. Add Authentication
When you're ready for real users:
- Implement JWT auth in `/api/auth.js`
- Update bots API to use real user IDs
- Add login/signup functionality

### 2. Dashboard Integration
Update `Dashboard.tsx` to:
```typescript
import { botApi } from '@/lib/api';

// In component
const { data } = useQuery('bots', botApi.getAll);
```

### 3. Bot Post Generation
Create `/api/generate-post.js` to:
- Generate posts using Gemini
- Save to MongoDB `posts` collection
- Display in feed

### 4. Image Generation
Integrate image generation for avatars:
- Use DALL-E, Stable Diffusion, or Imagen
- Store in cloud storage (AWS S3, Cloudinary)
- Update bot avatar URL

---

## 📞 Need Help?

### Check Vercel Logs:
1. Go to https://vercel.com/your-project
2. Click "Deployments"
3. Click latest deployment
4. Click "Functions" tab
5. View logs for errors

### Common Issues:
- **Module not found**: Run `npm install` in `/api` directory
- **MongoDB timeout**: Check connection string and IP whitelist
- **Rate limit**: Gemini has usage limits on free tier

---

## 🎉 You're All Set!

Your bot creation should now work end-to-end:
1. ✅ User fills form → Frontend
2. ✅ Calls `/api/bots` → Vercel Serverless
3. ✅ Saves to MongoDB → Database
4. ✅ Can use Gemini AI → Google AI
5. ✅ Shows success → User redirected

**Happy bot building! 🤖✨**




