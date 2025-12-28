import React, { useState } from 'react'

type Platform = 'youtube' | 'instagram' | 'twitter'

interface VideoFormat {
  formatId: string
  quality: string
  container: string
  resolution: string
  filesize: string
  fps?: number | null
  vcodec?: string
  acodec?: string
}

interface VideoInfo {
  success: boolean
  videoId?: string
  title?: string
  thumbnail?: string
  downloadUrl?: string
  formats?: VideoFormat[]
  message?: string
  error?: string
}

const VideoDownload: React.FC = () => {
  const [url, setUrl] = useState('')
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null)

  const detectPlatform = (url: string): Platform | null => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube'
    }
    if (url.includes('instagram.com')) {
      return 'instagram'
    }
    if (url.includes('twitter.com') || url.includes('x.com')) {
      return 'twitter'
    }
    return null
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUrl = e.target.value
    setUrl(inputUrl)
    setError(null)
    setVideoInfo(null)
    setSelectedFormat(null)

    if (inputUrl) {
      const detected = detectPlatform(inputUrl)
      setPlatform(detected)
      if (!detected) {
        setError('URL não reconhecida. Suportamos YouTube, Instagram e Twitter/X')
      }
    } else {
      setPlatform(null)
    }
  }

  const handleDownload = async () => {
    if (!url || !platform) {
      setError('Por favor, insira uma URL válida')
      return
    }

    setIsLoading(true)
    setError(null)
    setVideoInfo(null)
    setSelectedFormat(null)

    try {
      if (platform === 'youtube') {
        // Try local server first, then production server
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
        
        try {
          const localResponse = await fetch(`${apiBaseUrl}/api/download-youtube`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          })
          
          if (localResponse.ok) {
            const data = await localResponse.json()
            setVideoInfo(data)
            setIsLoading(false)
            return
          } else {
            const errorData = await localResponse.json().catch(() => ({}))
            throw new Error(errorData.error || 'Erro ao processar o vídeo')
          }
        } catch (err) {
          // If local fails and we're not in production, try production API
          if (apiBaseUrl.includes('localhost') && import.meta.env.PROD) {
            const prodUrl = import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '3000')
            try {
              const prodResponse = await fetch(`${prodUrl}/api/download-youtube`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
              })
              if (prodResponse.ok) {
                const data = await prodResponse.json()
                setVideoInfo(data)
                setIsLoading(false)
                return
              }
            } catch {
              // Production API also failed
            }
          }
          throw err
        }
        
        // Use external API (yt-dlp-api or similar)
        // For now, extract video info and provide download link
        const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/ |.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
        if (videoIdMatch && videoIdMatch[1]) {
          const videoId = videoIdMatch[1]
          
          // Get video info from oEmbed
          const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
          const oembedResponse = await fetch(oembedUrl)
          
          if (oembedResponse.ok) {
            const videoInfo = await oembedResponse.json()
            
            setVideoInfo({
              success: true,
              videoId,
              title: videoInfo.title,
              thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              downloadUrl: `https://www.youtube.com/watch?v=${videoId}`,
              message: 'Use o servidor de desenvolvimento local (npm run dev:api) para downloads completos, ou use ferramentas como yt-dlp localmente.',
            })
            setIsLoading(false)
            return
          }
        }
        
        throw new Error('Não foi possível processar o vídeo do YouTube')
      } else {
        // For other platforms, try local server or show info
        try {
          const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
          const endpointMap: Record<Platform, string> = {
            youtube: `${apiBaseUrl}/api/download-youtube`,
            instagram: `${apiBaseUrl}/api/download-instagram`,
            twitter: `${apiBaseUrl}/api/download-twitter`,
          }

          const response = await fetch(endpointMap[platform], {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          })

          if (response.ok) {
            const data = await response.json()
            setVideoInfo(data)
            setIsLoading(false)
            return
          } else {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || 'Erro ao processar o vídeo')
          }
        } catch (error) {
          console.error(`Error fetching ${platform} video:`, error)
          
          // Show error message
          const messages: Record<Platform, string> = {
            youtube: 'Servidor local não disponível. Execute: npm run dev:api',
            instagram: 'Erro ao processar vídeo do Instagram. Certifique-se de que o servidor está rodando (npm run dev:api) e que o vídeo é público.',
            twitter: 'Erro ao processar vídeo do Twitter/X. Certifique-se de que o servidor está rodando (npm run dev:api) e que o tweet contém vídeo e é público.',
          }
          
          setVideoInfo({
            success: false,
            error: messages[platform],
          })
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const getPlatformName = (platform: Platform): string => {
    const names: Record<Platform, string> = {
      youtube: 'YouTube',
      instagram: 'Instagram',
      twitter: 'Twitter/X',
    }
    return names[platform]
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Download de Vídeos</h1>
        <p className="text-gray-600">
          Baixe vídeos do YouTube, Instagram e Twitter/X
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="video-url"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cole a URL do vídeo
            </label>
            <input
              id="video-url"
              type="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-orange-primary outline-none"
            />
            {platform && (
              <p className="mt-2 text-sm text-gray-600">
                Plataforma detectada: <span className="font-semibold text-orange-primary">{getPlatformName(platform)}</span>
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleDownload}
            disabled={isLoading || !url || !platform}
            className="w-full px-6 py-3 bg-orange-primary text-white font-semibold rounded-lg hover:bg-orange-dark transition-colors focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {isLoading ? 'Processando...' : 'Processar Vídeo'}
          </button>
        </div>

        {videoInfo && (
          <div className="pt-6 border-t border-gray-200 space-y-4">
            {videoInfo.success ? (
              <>
                <div className="space-y-3">
                  {videoInfo.thumbnail && (
                    <div className="flex justify-center">
                      <img
                        src={videoInfo.thumbnail}
                        alt="Video thumbnail"
                        className="max-w-full h-auto rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  {videoInfo.title && (
                    <h3 className="text-lg font-semibold text-gray-900 text-center">
                      {videoInfo.title}
                    </h3>
                  )}
                </div>

                {videoInfo.message && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                    <p>{videoInfo.message}</p>
                  </div>
                )}

                {videoInfo.formats && videoInfo.formats.length > 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Escolha a qualidade:
                      </label>
                      <p className="text-xs text-gray-500 mb-3">
                        💡 O áudio será combinado automaticamente com a qualidade de vídeo selecionada
                      </p>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {videoInfo.formats.map((format) => (
                          <button
                            key={format.formatId}
                            onClick={() => setSelectedFormat(format.formatId)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                              selectedFormat === format.formatId
                                ? 'border-orange-primary bg-orange-50'
                                : 'border-gray-200 bg-white hover:border-orange-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900 text-lg">
                                    {format.quality}
                                  </span>
                                  <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                                    {format.container.toUpperCase()}
                                  </span>
                                  {format.fps && (
                                    <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                                      {format.fps} fps
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                  <span>📐 {format.resolution}</span>
                                  <span>💾 {format.filesize}</span>
                                </div>
                              </div>
                              {selectedFormat === format.formatId && (
                                <div className="ml-4">
                                  <div className="w-6 h-6 bg-orange-primary rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedFormat && videoInfo.downloadUrl && (
                      <a
                        href={`${videoInfo.downloadUrl}&formatId=${selectedFormat}`}
                        download
                        className="block w-full px-8 py-4 bg-orange-primary text-white font-semibold rounded-lg hover:bg-orange-dark transition-colors focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2 min-h-[44px] text-lg text-center"
                      >
                        ⬇️ Baixar Vídeo na Qualidade Selecionada
                      </a>
                    )}

                    {!selectedFormat && (
                      <p className="text-center text-sm text-gray-500">
                        👆 Selecione uma qualidade acima para fazer o download
                      </p>
                    )}
                  </div>
                )}

                {videoInfo.downloadUrl && (!videoInfo.formats || videoInfo.formats.length === 0) && (
                  <div className="text-center space-y-3">
                    <a
                      href={videoInfo.downloadUrl}
                      download
                      className="inline-block px-8 py-4 bg-orange-primary text-white font-semibold rounded-lg hover:bg-orange-dark transition-colors focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2 min-h-[44px] text-lg"
                    >
                      ⬇️ Baixar Vídeo
                    </a>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {videoInfo.error || 'Erro ao processar o vídeo'}
              </div>
            )}
          </div>
        )}

        <div className="pt-6 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-gray-900">Como usar:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Copie a URL do vídeo que deseja baixar</li>
              <li>Cole a URL no campo acima</li>
              <li>Clique em "Processar Vídeo"</li>
              <li>O sistema detectará automaticamente a plataforma</li>
              <li>Para YouTube: escolha a qualidade desejada</li>
              <li>Para Instagram e Twitter: download automático na melhor qualidade</li>
            </ol>
            <p className="text-xs text-gray-500 mt-3">
              Suporta vídeos públicos de: <strong>YouTube, Instagram e Twitter/X</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoDownload

