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
    // Extract tweet ID from Twitter/X URL
    const twitterRegex = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/
    const match = url.match(twitterRegex)

    if (!match) {
      return response.status(400).json({ error: 'Invalid Twitter/X URL' })
    }

    const tweetId = match[1]

    // Twitter/X requires API authentication for video downloads
    // Public scraping or third-party APIs can be used
    
    return response.status(200).json({
      success: true,
      tweetId,
      url,
      message: 'Twitter/X download requires API authentication or specialized tools',
      note: 'Consider using Twitter API v2 or third-party services',
    })
  } catch (error) {
    console.error('Error processing Twitter URL:', error)
    return response.status(500).json({ error: 'Internal server error' })
  }
}

