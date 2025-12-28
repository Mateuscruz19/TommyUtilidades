import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { url } = request.body

  if (!url || typeof url !== 'string') {
    return response.status(400).json({ error: 'URL is required' })
  }

  try {
    // Validate Instagram URL
    const instagramRegex = /instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/
    const match = url.match(instagramRegex)

    if (!match) {
      return response.status(400).json({ error: 'Invalid Instagram URL' })
    }

    const mediaType = match[1]
    const mediaId = match[2]

    // Instagram requires authentication for API access
    // For public content, we can try to extract from oEmbed or use scraping
    // Note: Instagram has strict rate limits and may block requests
    
    return response.status(200).json({
      success: true,
      mediaId,
      mediaType,
      url,
      message: 'Instagram download requires authentication or specialized tools',
      note: 'Consider using Instagram Basic Display API or scraping tools',
    })
  } catch (error) {
    console.error('Error processing Instagram URL:', error)
    return response.status(500).json({ error: 'Internal server error' })
  }
}

