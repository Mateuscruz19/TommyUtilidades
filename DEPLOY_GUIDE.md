# 🚀 Deploy Guide - Tommy Utilidades

Complete guide to deploy the Tommy Utilidades application.

## Architecture Overview

- **Frontend**: Vercel (Static + Serverless for simple APIs)
- **Backend**: Railway/Render (Node.js server for video downloads)

---

## 📦 PART 1: Deploy Backend (Railway)

Railway is the easiest option for deploying the Node.js backend.

### Step 1: Prepare Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Click "New Project"

### Step 2: Deploy from GitHub

1. Select "Deploy from GitHub repo"
2. Choose `Mateuscruz19/TommyUtilidades`
3. Railway will auto-detect the Node.js project

### Step 3: Configure Railway

1. Go to your project settings
2. Click on "Variables" tab
3. Add these environment variables:
   ```
   PORT=3000
   NODE_ENV=production
   ```

4. Go to "Settings" tab
5. Set "Start Command":
   ```
   node server.mjs
   ```

6. Click "Deploy"

### Step 4: Get Backend URL

1. After deployment, go to "Settings"
2. Click "Generate Domain"
3. Copy the URL (e.g., `https://your-app.up.railway.app`)
4. **Save this URL** - you'll need it for the frontend!

### Step 5: Install yt-dlp in Railway

Railway needs yt-dlp installed. Add a `nixpacks.toml` file:

Create file: `nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ["nodejs", "python311", "yt-dlp"]

[phases.install]
cmds = ["npm install"]

[start]
cmd = "node server.mjs"
```

Then commit and push:
```bash
git add nixpacks.toml
git commit -m "chore: add Railway nixpacks configuration for yt-dlp"
git push
```

Railway will automatically redeploy.

---

## 🌐 PART 2: Deploy Frontend (Vercel)

### Step 1: Update Frontend to Use Backend URL

Create a `.env.production` file:
```bash
VITE_API_URL=https://your-app.up.railway.app
```

Replace `https://your-app.up.railway.app` with your Railway URL from Part 1.

### Step 2: Update VideoDownload.tsx

Make sure the frontend uses the environment variable:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
```

### Step 3: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Click "Add New Project"
4. Import `Mateuscruz19/TommyUtilidades`
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: Your Railway URL (e.g., `https://your-app.up.railway.app`)
7. Click "Deploy"

#### Option B: Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

When prompted, add the environment variable:
- `VITE_API_URL` = Your Railway backend URL

---

## 🔗 PART 3: Connect Everything

### Update CORS in Backend

Edit `server.mjs` to allow your Vercel domain:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://tommy-utilidades.vercel.app', // Your Vercel URL
    // Add your custom domain if you have one
  ]
}))
```

Commit and push:
```bash
git add server.mjs
git commit -m "chore: update CORS for production"
git push
```

---

## ✅ Verification Checklist

After deployment, test each feature:

- [ ] **QR Generator** - Should work (client-side only)
- [ ] **Image Compressor** - Should work (client-side only)
- [ ] **PDF Converter** - Should work (client-side only)
- [ ] **Video Download** - Requires backend to be running

### Test Video Download:

1. Go to your Vercel URL: `https://your-app.vercel.app`
2. Navigate to "Baixar Vídeo"
3. Paste a YouTube URL
4. Check if it loads video info
5. Try downloading in different qualities

---

## 🆓 Alternative: Render (Free Tier)

If you prefer Render over Railway:

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.mjs`
   - **Add Environment Variables**: same as Railway
6. Add to "Native Environment":
   ```
   yt-dlp
   python3
   ```
7. Deploy

⚠️ **Note**: Render free tier has cold starts (may take 30s to wake up)

---

## 💰 Cost Estimate

| Service | Cost | Notes |
|---------|------|-------|
| Vercel (Frontend) | **FREE** | 100GB bandwidth/month |
| Railway (Backend) | **$5/month** | 500 hours/month, $5 credit free |
| Render (Backend Alternative) | **FREE** | With cold starts |

---

## 🐛 Troubleshooting

### Video downloads not working?

1. Check Railway logs: `railway logs`
2. Verify `VITE_API_URL` in Vercel environment variables
3. Check CORS settings in `server.mjs`
4. Ensure yt-dlp is installed on Railway

### "Failed to fetch" errors?

- Backend might be sleeping (Render free tier)
- Check if Railway URL is correct in Vercel env variables
- Open Railway URL directly to wake it up

### Python version issues?

Make sure `nixpacks.toml` specifies `python311` or higher.

---

## 🎉 Next Steps

Once deployed:

1. **Test all features** thoroughly
2. **Add custom domain** in Vercel (optional)
3. **Monitor Railway usage** to avoid unexpected costs
4. **Update README** with your live URLs

---

## 📞 Support

If you need help:
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- yt-dlp Issues: https://github.com/yt-dlp/yt-dlp/issues

