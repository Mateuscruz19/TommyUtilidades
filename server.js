// Simple development server for API routes
// Run with: npm run dev:api
// Or use: npm run dev:all to run both API and frontend

import express from 'express'
import cors from 'cors'
const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

// YouTube download endpoint
app.post('/api/download-youtube', async (req, res) => {
  try {
    const { url } = req.body

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' })
    }

    // Extract video ID from YouTube URL
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    
    if (!videoIdMatch) {
      return res.status(400).json({ error: 'Invalid YouTube URL' })
    }

    const videoId = videoIdMatch[1]

    // Use YouTube oEmbed API to get video info
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    const oembedResponse = await fetch(oembedUrl)
    
    if (!oembedResponse.ok) {
      return res.status(400).json({ error: 'Could not fetch video information' })
    }

    const videoInfo = await oembedResponse.json()

    return res.status(200).json({
      success: true,
      videoId,
      title: videoInfo.title,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      downloadUrl: `https://www.youtube.com/watch?v=${videoId}`,
      message: 'Para download completo, use ferramentas como yt-dlp no servidor',
    })
  } catch (error) {
    console.error('Error processing YouTube URL:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Instagram download endpoint
app.post('/api/download-instagram', async (req, res) => {
  try {
    const { url } = req.body

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' })
    }

    const instagramRegex = /instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/
    const match = url.match(instagramRegex)

    if (!match) {
      return res.status(400).json({ error: 'Invalid Instagram URL' })
    }

    const mediaType = match[1]
    const mediaId = match[2]

    return res.status(200).json({
      success: true,
      mediaId,
      mediaType,
      url,
      message: 'Instagram download requires authentication or specialized tools',
      note: 'Consider using Instagram Basic Display API or scraping tools',
    })
  } catch (error) {
    console.error('Error processing Instagram URL:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// TikTok download endpoint
app.post('/api/download-tiktok', async (req, res) => {
  try {
    const { url } = req.body

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' })
    }

    const tiktokRegex = /(?:tiktok\.com\/)(?:.*\/)?(?:video\/)?(\d+)/
    const match = url.match(tiktokRegex)

    if (!match) {
      return res.status(400).json({ error: 'Invalid TikTok URL' })
    }

    const videoId = match[1]

    return res.status(200).json({
      success: true,
      videoId,
      url,
      message: 'TikTok download requires specialized tools or APIs',
      note: 'Consider using TikTok API or third-party services',
    })
  } catch (error) {
    console.error('Error processing TikTok URL:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Twitter download endpoint
app.post('/api/download-twitter', async (req, res) => {
  try {
    const { url } = req.body

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' })
    }

    const twitterRegex = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/
    const match = url.match(twitterRegex)

    if (!match) {
      return res.status(400).json({ error: 'Invalid Twitter/X URL' })
    }

    const tweetId = match[1]

    return res.status(200).json({
      success: true,
      tweetId,
      url,
      message: 'Twitter/X download requires API authentication or specialized tools',
      note: 'Consider using Twitter API v2 or third-party services',
    })
  } catch (error) {
    console.error('Error processing Twitter URL:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`)
  console.log(`📝 Frontend should be running on http://localhost:5173`)
  console.log(`💡 Use 'npm run dev:all' to run both servers together`)
})

