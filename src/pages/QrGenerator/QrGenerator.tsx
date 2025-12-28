import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

const QrGenerator: React.FC = () => {
  const [text, setText] = useState('')
  const [size, setSize] = useState(256)
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M')

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = size
      canvas.height = size
      if (ctx) {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, size, size)
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'qrcode.png'
            link.click()
            URL.revokeObjectURL(url)
          }
        })
      }
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Gerador de QR Code</h1>
        <p className="text-gray-600">
          Crie QR Codes personalizados para links, textos, emails e muito mais
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
              Texto ou URL
            </label>
            <textarea
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite o texto, URL, email ou qualquer conteúdo..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-orange-primary outline-none resize-none"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="size-input" className="block text-sm font-medium text-gray-700 mb-2">
                Tamanho: {size}px
              </label>
              <input
                id="size-input"
                type="range"
                min="128"
                max="512"
                step="32"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-primary"
              />
            </div>

            <div>
              <label htmlFor="error-level" className="block text-sm font-medium text-gray-700 mb-2">
                Nível de Correção de Erro
              </label>
              <select
                id="error-level"
                value={errorCorrectionLevel}
                onChange={(e) => setErrorCorrectionLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-orange-primary outline-none"
              >
                <option value="L">Baixo (~7%)</option>
                <option value="M">Médio (~15%)</option>
                <option value="Q">Alto (~25%)</option>
                <option value="H">Muito Alto (~30%)</option>
              </select>
            </div>

            <div>
              <label htmlFor="fg-color" className="block text-sm font-medium text-gray-700 mb-2">
                Cor do QR Code
              </label>
              <div className="flex items-center space-x-3">
                <input
                  id="fg-color"
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-orange-primary outline-none"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bg-color" className="block text-sm font-medium text-gray-700 mb-2">
                Cor de Fundo
              </label>
              <div className="flex items-center space-x-3">
                <input
                  id="bg-color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-orange-primary outline-none"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          </div>
        </div>

        {text && (
          <div className="flex flex-col items-center space-y-4 pt-6 border-t border-gray-200">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <QRCodeSVG
                id="qr-code-svg"
                value={text}
                size={size}
                fgColor={fgColor}
                bgColor={bgColor}
                level={errorCorrectionLevel}
                includeMargin={true}
              />
            </div>
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-orange-primary text-white font-semibold rounded-lg hover:bg-orange-dark transition-colors focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2 min-h-[44px]"
            >
              Baixar QR Code
            </button>
          </div>
        )}

        {!text && (
          <div className="text-center py-12 text-gray-400">
            <p>Digite algo acima para gerar o QR Code</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default QrGenerator

