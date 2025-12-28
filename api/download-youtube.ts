import type { VercelRequest, VercelResponse } from '@vercel/node'
import ytdl from 'ytdl-core'

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method === 'GET') {
    // Stream download endpoint
    try {
      const { url } = request.query

      if (!url || typeof url !== 'string') {
        return response.status(400).json({ error: 'URL is required' })
      }

      if (!ytdl.validateURL(url)) {
        return response.status(400).json({ error: 'Invalid YouTube URL' })
      }

      const info = await ytdl.getInfo(url)
      const title = info.videoDetails.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)
      
      response.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`)
      response.setHeader('Content-Type', 'video/mp4')

      ytdl(url, {
        quality: 'highest',
        filter: 'audioandvideo',
      }).pipe(response)

      return
    } catch (error) {
      console.error('Error streaming YouTube video:', error)
      if (!response.headersSent) {
        return response.status(500).json({ error: 'Erro ao fazer download do vídeo' })
      }
    }
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { url } = request.body

  if (!url || typeof url !== 'string') {
    return response.status(400).json({ error: 'URL is required' })
  }

  try {
    if (!ytdl.validateURL(url)) {
      return response.status(400).json({ error: 'Invalid YouTube URL' })
    }

    const info = await ytdl.getInfo(url)
    const videoId = info.videoDetails.videoId
    const title = info.videoDetails.title
    const thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1]?.url || 
                     `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

    const formats = info.formats
      .filter(format => format.hasVideo && format.hasAudio)
      .map(format => ({
        quality: format.qualityLabel || format.quality,
        container: format.container,
        url: format.url,
      }))

    return response.status(200).json({
      success: true,
      videoId,
      title,
      thumbnail,
      formats,
      downloadUrl: `/api/download-youtube?url=${encodeURIComponent(url)}`,
      message: 'Clique no botão de download para baixar o vídeo',
    })
  } catch (error) {
    console.error('Error processing YouTube URL:', error)
    return response.status(500).json({ 
      error: error instanceof Error ? error.message : 'Erro ao processar o vídeo do YouTube' 
    })
  }
}

