// Simple development server for API routes
// Run with: npm run dev:api
// Or use: npm run dev:all to run both API and frontend

// Set Homebrew Python in PATH before importing anything
process.env.PATH = '/opt/homebrew/bin:/opt/homebrew/sbin:' + process.env.PATH

import express from 'express'
import cors from 'cors'
import youtubedl from 'youtube-dl-exec'

const app = express()
const PORT = process.env.PORT || 3000

// Detect base URL for production/development
const BASE_URL = process.env.RAILWAY_PUBLIC_DOMAIN 
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : process.env.RENDER_EXTERNAL_URL
  ? process.env.RENDER_EXTERNAL_URL
  : `http://localhost:${PORT}`

// CORS configuration - allow frontend origins
const allowedOrigins = [
  'http://localhost:5173',  // Local development
  'http://localhost:3000',  // Alternative local port
  process.env.FRONTEND_URL, // Production frontend URL from environment variable
]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true)
    
    // Allow all Vercel preview/production domains
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true)
    }
    
    // Check allowed origins list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))

app.use(express.json())

// YouTube download endpoint - Get video info
app.post('/api/download-youtube', async (req, res) => {
  try {
    const { url } = req.body

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL é obrigatória' })
    }

    // Extract video ID first for validation
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    
    if (!videoIdMatch) {
      return res.status(400).json({ error: 'URL do YouTube inválida' })
    }

    const videoId = videoIdMatch[1]

    // Get video info using yt-dlp
    let info
    try {
      info = await youtubedl(url, {
        dumpSingleJson: true,
        noWarnings: true,
        noCheckCertificate: true,
        // Don't skip DASH manifest to get all quality options
      })
    } catch (error) {
      console.error('Error getting video info:', error)
      throw new Error('Não foi possível obter informações do vídeo. Por favor, instale yt-dlp: brew install yt-dlp')
    }

    const title = info.title || 'video'
    const thumbnail = info.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

    // Get available formats - prioritize high quality
    // Filter only video formats (audio will be merged automatically)
    const videoFormats = (info.formats || [])
      .filter(format => 
        format.vcodec !== 'none' && // Has video
        format.height && format.height > 0 && // Has valid resolution
        (format.ext === 'mp4' || format.ext === 'webm') // Common video containers
      )
      .sort((a, b) => {
        // Sort by height (resolution) descending
        const heightA = a.height || 0
        const heightB = b.height || 0
        return heightB - heightA
      })

    // Remove duplicates by resolution, keep the best quality for each
    const uniqueFormats = []
    const seenResolutions = new Set()
    
    for (const format of videoFormats) {
      const resolution = format.height
      if (!seenResolutions.has(resolution)) {
        seenResolutions.add(resolution)
        uniqueFormats.push({
          formatId: format.format_id,
          quality: format.format_note || `${format.height}p`,
          container: 'mp4',
          resolution: `${format.width}x${format.height}`,
          filesize: format.filesize 
            ? `${(format.filesize / 1024 / 1024).toFixed(1)} MB` 
            : (format.filesize_approx 
                ? `~${(format.filesize_approx / 1024 / 1024).toFixed(1)} MB` 
                : 'Calculando...'),
          fps: format.fps || null,
          vcodec: format.vcodec,
          acodec: 'merged', // Audio will be merged
        })
      }
    }

    const formats = uniqueFormats.slice(0, 10) // Limit to top 10 formats

    return res.status(200).json({
      success: true,
      videoId,
      title,
      thumbnail,
      formats,
      downloadUrl: `${BASE_URL}/api/download-youtube-stream?url=${encodeURIComponent(url)}`,
      message: 'Clique no botão de download para baixar o vídeo',
    })
  } catch (error) {
    console.error('Error processing YouTube URL:', error)
    return res.status(500).json({ 
      error: error.message || 'Erro ao processar o vídeo do YouTube. Tente novamente mais tarde.' 
    })
  }
})

// YouTube download stream endpoint - Download video
app.get('/api/download-youtube-stream', async (req, res) => {
  try {
    const { url, formatId } = req.query

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL é obrigatória' })
    }

    // Extract video ID for validation
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    
    if (!videoIdMatch) {
      return res.status(400).json({ error: 'URL do YouTube inválida' })
    }

    // Get video info for filename
    let info
    try {
      info = await youtubedl(url, {
        dumpSingleJson: true,
        noWarnings: true,
      })
    } catch (error) {
      console.error('Error getting video info:', error)
      return res.status(500).json({ error: 'Erro ao obter informações do vídeo' })
    }

    const title = (info.title || 'video').replace(/[^a-z0-9]/gi, '_').substring(0, 50)
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`)
    res.setHeader('Content-Type', 'video/mp4')

    // Determine format to download
    let format
    if (formatId && typeof formatId === 'string') {
      // User selected a specific format - merge it with best audio
      format = `${formatId}+bestaudio/best`
    } else {
      // Default to best quality with audio merged
      format = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best'
    }

    console.log(`Downloading video with format: ${format}`)

    // Download video using yt-dlp and pipe to response
    const videoProcess = youtubedl.exec(url, {
      format: format,
      mergeOutputFormat: 'mp4',
      output: '-', // Output to stdout
      // Add postprocessor args to ensure proper merging
      addMetadata: true,
    })

    videoProcess.stdout.pipe(res)

    videoProcess.stderr.on('data', (data) => {
      console.error('yt-dlp stderr:', data.toString())
    })

    videoProcess.on('error', (error) => {
      console.error('Process error:', error)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro ao fazer download do vídeo' })
      }
    })

  } catch (error) {
    console.error('Error streaming YouTube video:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao fazer download do vídeo' })
    }
  }
})

// Instagram download endpoint - Get video info
app.post('/api/download-instagram', async (req, res) => {
  try {
    const { url } = req.body

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL é obrigatória' })
    }

    const instagramRegex = /instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/
    const match = url.match(instagramRegex)

    if (!match) {
      return res.status(400).json({ error: 'URL do Instagram inválida' })
    }

    const mediaId = match[2]

    // Get video info using yt-dlp
    let info
    try {
      info = await youtubedl(url, {
        dumpSingleJson: true,
        noWarnings: true,
        noCheckCertificate: true,
      })
    } catch (error) {
      console.error('Error getting Instagram video info:', error)
      throw new Error('Não foi possível obter informações do vídeo do Instagram. Certifique-se de que o vídeo é público.')
    }

    const title = info.title || 'Instagram Video'
    const thumbnail = info.thumbnail || ''

    return res.status(200).json({
      success: true,
      videoId: mediaId,
      title,
      thumbnail,
      downloadUrl: `${BASE_URL}/api/download-instagram-stream?url=${encodeURIComponent(url)}`,
      message: 'Clique no botão de download para baixar o vídeo',
    })
  } catch (error) {
    console.error('Error processing Instagram URL:', error)
    return res.status(500).json({ 
      error: error.message || 'Erro ao processar o vídeo do Instagram. Tente novamente mais tarde.' 
    })
  }
})

// Instagram download stream endpoint - Download video
app.get('/api/download-instagram-stream', async (req, res) => {
  try {
    const { url } = req.query

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL é obrigatória' })
    }

    const instagramRegex = /instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/
    const match = url.match(instagramRegex)

    if (!match) {
      return res.status(400).json({ error: 'URL do Instagram inválida' })
    }

    // Get video info for filename
    let info
    try {
      info = await youtubedl(url, {
        dumpSingleJson: true,
        noWarnings: true,
      })
    } catch (error) {
      console.error('Error getting Instagram video info:', error)
      return res.status(500).json({ error: 'Erro ao obter informações do vídeo' })
    }

    const title = (info.title || 'instagram_video').replace(/[^a-z0-9]/gi, '_').substring(0, 50)
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`)
    res.setHeader('Content-Type', 'video/mp4')

    console.log(`Downloading Instagram video: ${title}`)

    // Download video using yt-dlp and pipe to response
    const videoProcess = youtubedl.exec(url, {
      format: 'best[ext=mp4]/best',
      mergeOutputFormat: 'mp4',
      output: '-', // Output to stdout
    })

    videoProcess.stdout.pipe(res)

    videoProcess.stderr.on('data', (data) => {
      console.error('yt-dlp stderr:', data.toString())
    })

    videoProcess.on('error', (error) => {
      console.error('Process error:', error)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro ao fazer download do vídeo' })
      }
    })

  } catch (error) {
    console.error('Error streaming Instagram video:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao fazer download do vídeo' })
    }
  }
})

// Twitter download endpoint - Get video info
app.post('/api/download-twitter', async (req, res) => {
  try {
    const { url } = req.body

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL é obrigatória' })
    }

    const twitterRegex = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/
    const match = url.match(twitterRegex)

    if (!match) {
      return res.status(400).json({ error: 'URL do Twitter/X inválida' })
    }

    // Twitter/X has implemented strict API restrictions
    // Returning a user-friendly error message
    return res.status(503).json({ 
      success: false,
      error: 'Downloads do Twitter/X estão temporariamente indisponíveis devido às restrições da plataforma. Por favor, use YouTube ou Instagram.',
      platform: 'twitter',
      unavailable: true
    })

    /* Commented out until Twitter/X API issues are resolved
    const tweetId = match[1]

    // Get video info using yt-dlp
    let info
    try {
      info = await youtubedl(url, {
        dumpSingleJson: true,
        noWarnings: true,
        noCheckCertificate: true,
      })
    } catch (error) {
      console.error('Error getting Twitter video info:', error)
      throw new Error('Não foi possível obter informações do vídeo do Twitter/X. Certifique-se de que o tweet contém vídeo e é público.')
    }

    const title = info.title || 'Twitter Video'
    const thumbnail = info.thumbnail || ''

    return res.status(200).json({
      success: true,
      videoId: tweetId,
      title,
      thumbnail,
      downloadUrl: `${BASE_URL}/api/download-twitter-stream?url=${encodeURIComponent(url)}`,
      message: 'Clique no botão de download para baixar o vídeo',
    })
    */
  } catch (error) {
    console.error('Error processing Twitter URL:', error)
    return res.status(500).json({ 
      error: error.message || 'Erro ao processar o vídeo do Twitter/X. Tente novamente mais tarde.' 
    })
  }
})

// Twitter download stream endpoint - Download video
app.get('/api/download-twitter-stream', async (req, res) => {
  try {
    const { url } = req.query

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL é obrigatória' })
    }

    const twitterRegex = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/
    const match = url.match(twitterRegex)

    if (!match) {
      return res.status(400).json({ error: 'URL do Twitter/X inválida' })
    }

    // Get video info for filename
    let info
    try {
      info = await youtubedl(url, {
        dumpSingleJson: true,
        noWarnings: true,
      })
    } catch (error) {
      console.error('Error getting Twitter video info:', error)
      return res.status(500).json({ error: 'Erro ao obter informações do vídeo' })
    }

    const title = (info.title || 'twitter_video').replace(/[^a-z0-9]/gi, '_').substring(0, 50)
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`)
    res.setHeader('Content-Type', 'video/mp4')

    console.log(`Downloading Twitter video: ${title}`)

    // Download video using yt-dlp and pipe to response
    const videoProcess = youtubedl.exec(url, {
      format: 'best[ext=mp4]/best',
      mergeOutputFormat: 'mp4',
      output: '-', // Output to stdout
    })

    videoProcess.stdout.pipe(res)

    videoProcess.stderr.on('data', (data) => {
      console.error('yt-dlp stderr:', data.toString())
    })

    videoProcess.on('error', (error) => {
      console.error('Process error:', error)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro ao fazer download do vídeo' })
      }
    })

  } catch (error) {
    console.error('Error streaming Twitter video:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao fazer download do vídeo' })
    }
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`)
  console.log(`📝 Frontend should be running on http://localhost:5173`)
  console.log(`💡 Use 'npm run dev:all' to run both servers together`)
})

