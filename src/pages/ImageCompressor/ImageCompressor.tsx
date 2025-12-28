import React, { useState } from 'react'
import imageCompression from 'browser-image-compression'

interface CompressedImage {
  file: File
  originalSize: number
  compressedSize: number
  url: string
}

const ImageCompressor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null)
  const [compressedImage, setCompressedImage] = useState<CompressedImage | null>(null)
  const [quality, setQuality] = useState(0.8)
  const [maxWidth, setMaxWidth] = useState(1920)
  const [maxHeight, setMaxHeight] = useState(1920)
  const [isCompressing, setIsCompressing] = useState(false)
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setOriginalImage(file)
      setCompressedImage(null)
    } else {
      alert('Por favor, selecione um arquivo de imagem válido.')
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getReductionPercentage = (original: number, compressed: number): number => {
    return Math.round(((original - compressed) / original) * 100)
  }

  const handleCompress = async () => {
    if (!originalImage) return

    setIsCompressing(true)
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: Math.max(maxWidth, maxHeight),
        useWebWorker: true,
        fileType: `image/${format}`,
      }

      const compressedFile = await imageCompression(originalImage, options)

      const compressedUrl = URL.createObjectURL(compressedFile)
      setCompressedImage({
        file: compressedFile,
        originalSize: originalImage.size,
        compressedSize: compressedFile.size,
        url: compressedUrl,
      })
    } catch (error) {
      console.error('Erro ao comprimir imagem:', error)
      alert('Erro ao comprimir a imagem. Tente novamente.')
    } finally {
      setIsCompressing(false)
    }
  }

  const handleDownload = () => {
    if (!compressedImage) return

    const link = document.createElement('a')
    link.href = compressedImage.url
    link.download = `compressed_${originalImage?.name || 'image'}.${format}`
    link.click()
  }

  const resetAll = () => {
    setOriginalImage(null)
    setCompressedImage(null)
    setQuality(0.8)
    setMaxWidth(1920)
    setMaxHeight(1920)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Comprimir Imagens</h1>
        <p className="text-gray-600">
          Reduza o tamanho das suas imagens mantendo a qualidade visual
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="image-input"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Selecione uma imagem
            </label>
            <input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-orange-primary outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-primary file:text-white hover:file:bg-orange-dark"
            />
          </div>

          {originalImage && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="quality-input"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Qualidade: {Math.round(quality * 100)}%
                  </label>
                  <input
                    id="quality-input"
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="format-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Formato de Saída
                  </label>
                  <select
                    id="format-select"
                    value={format}
                    onChange={(e) => setFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-orange-primary outline-none"
                  >
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="max-width"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Largura Máxima: {maxWidth}px
                  </label>
                  <input
                    id="max-width"
                    type="range"
                    min="320"
                    max="3840"
                    step="160"
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="max-height"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Altura Máxima: {maxHeight}px
                  </label>
                  <input
                    id="max-height"
                    type="range"
                    min="320"
                    max="3840"
                    step="160"
                    value={maxHeight}
                    onChange={(e) => setMaxHeight(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCompress}
                  disabled={isCompressing}
                  className="flex-1 px-6 py-3 bg-orange-primary text-white font-semibold rounded-lg hover:bg-orange-dark transition-colors focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {isCompressing ? 'Comprimindo...' : 'Comprimir Imagem'}
                </button>
                <button
                  onClick={resetAll}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 min-h-[44px]"
                >
                  Limpar
                </button>
              </div>
            </>
          )}
        </div>

        {originalImage && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Imagem Original</h3>
              <div className="relative">
                <img
                  src={URL.createObjectURL(originalImage)}
                  alt="Original"
                  className="w-full h-auto rounded-lg border border-gray-200"
                />
              </div>
              <p className="text-sm text-gray-600">
                Tamanho: {formatBytes(originalImage.size)}
              </p>
            </div>

            {compressedImage && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Imagem Comprimida</h3>
                <div className="relative">
                  <img
                    src={compressedImage.url}
                    alt="Compressed"
                    className="w-full h-auto rounded-lg border border-gray-200"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Tamanho: {formatBytes(compressedImage.compressedSize)}
                  </p>
                  <p className="text-sm font-semibold text-green-600">
                    Redução: {getReductionPercentage(
                      compressedImage.originalSize,
                      compressedImage.compressedSize
                    )}%
                  </p>
                  <button
                    onClick={handleDownload}
                    className="w-full mt-2 px-4 py-2 bg-orange-primary text-white font-semibold rounded-lg hover:bg-orange-dark transition-colors focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2 min-h-[44px]"
                  >
                    Baixar Imagem Comprimida
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!originalImage && (
          <div className="text-center py-12 text-gray-400">
            <p>Selecione uma imagem para começar</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageCompressor

