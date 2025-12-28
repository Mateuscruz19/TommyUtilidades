# Tommy Utilidades

Daily utility website with useful tools: video downloads, PDF conversion, image compression, and QR code generator.

## 🚀 Features

- **Video Downloader**: 
  - ✅ YouTube (with quality selection: 1080p, 720p, 480p, etc.)
  - ✅ Instagram (best available quality - public posts and reels)
  - ✅ Twitter/X (best available quality - public tweets)
- **PDF Converter**: Convert images, documents, HTML, and text to PDF
- **Image Compressor**: Reduce image size while maintaining quality
- **QR Code Generator**: Create custom QR codes

## 🛠️ Technologies

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Node.js + Express (API server)
- yt-dlp (video downloads)

## 📦 Installation

```bash
# 1. Install dependencies
npm install

# 2. Install yt-dlp (required for video downloads)
brew install yt-dlp

# 3. Run the development server
npm run dev:all
```

**Or run separately:**
- `npm run dev:api` - Backend (port 3000)
- `npm run dev` - Frontend (port 5173)

**Access:** http://localhost:5173

**Note**: API routes (`/api/*`) need the server running. In production on Vercel, they work automatically.

## 🚢 Deployment

### Frontend (Vercel)
1. Connect your repository to Vercel
2. Configure the environment variable `VITE_API_URL` with your backend server URL
3. Automatic deployment

### Backend (Dedicated Server)

The backend needs to be deployed on a dedicated server. Options:

#### Railway (Recommended - Free tier available)
1. Connect your repository to Railway
2. Railway will automatically detect `server.mjs`
3. Configure the `PORT` variable (Railway sets it automatically)
4. Copy the deployment URL and configure it in the frontend as `VITE_API_URL`

#### Render
1. Create a new Web Service
2. Use the command: `node server.mjs`
3. Configure the `PORT` variable

#### Docker
```bash
docker build -t tommy-utilidades-api .
docker run -p 3000:3000 tommy-utilidades-api
```

## 📱 Design

- **Mobile-First**: Fully optimized for mobile devices
- **Theme**: Orange (#FF6B35) and White
- **Visual Identity**: Dog theme
- **Language**: Brazilian Portuguese UI (code in English)

## 📝 Important Notes

### Video Downloads

**⚠️ Vercel Serverless Limitations:**
- Vercel Serverless Functions have a timeout of 10s (free) or 60s (Pro)
- Not ideal for streaming large videos
- **Recommendation**: Use local development server for full downloads

**For downloads to work:**
1. **Development**: Run `npm run dev:api` or `npm run dev:all`
2. **Production**: Deploy `server.mjs` to Railway, Render, or similar
3. Configure `VITE_API_URL` in the frontend pointing to the backend server

**Implemented fixes:**
- ✅ Migrated to `youtube-dl-exec` (yt-dlp wrapper - more stable and maintained)
- ✅ yt-dlp is automatically installed by the library
- ✅ Better error handling and messages
- ✅ Dedicated server system for downloads (doesn't use Vercel Serverless)
- ✅ Compatible with Node.js 18-24

**Other features:**
- QR Code, PDF, and Compression work 100% in the browser (client-side)
- Don't need a server

## 🎯 Supported Platforms

### Video Downloads
- **YouTube**: Full support with quality selection
- **Instagram**: Public posts and reels
- **Twitter/X**: Public tweets with videos

### PDF Converter
- Images (JPEG, PNG, GIF, WebP)
- Documents (multiple images to single PDF)
- HTML to PDF
- Text to PDF

### Image Compressor
- JPEG/JPG
- PNG
- WebP
- Configurable quality and size

### QR Code Generator
- URLs
- Plain text
- Contact information
- Wi-Fi credentials
- Custom size and colors

## 📄 License

This project is private.
