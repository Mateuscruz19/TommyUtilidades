import React, { useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import mammoth from 'mammoth'

type ConversionType = 'image' | 'html' | 'text' | 'document'

const PdfConverter: React.FC = () => {
  const [conversionType, setConversionType] = useState<ConversionType>('image')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [htmlContent, setHtmlContent] = useState('')
  const [textContent, setTextContent] = useState('')
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
    } else {
      alert('Por favor, selecione um arquivo de imagem válido.')
    }
  }

  const handleTextFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setTextContent(content)
      }
      reader.readAsText(file)
      setSelectedFile(file)
    }
  }

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ]
      if (validTypes.includes(file.type) || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        setDocumentFile(file)
      } else {
        alert('Por favor, selecione um arquivo Word válido (.docx ou .doc).')
      }
    }
  }

  const convertImageToPdf = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    try {
      const img = new Image()
      const url = URL.createObjectURL(selectedFile)

      img.onload = () => {
        const pdf = new jsPDF({
          orientation: img.width > img.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [img.width, img.height],
        })

        pdf.addImage(url, 'PNG', 0, 0, img.width, img.height)
        pdf.save(`converted_${selectedFile.name.replace(/\.[^/.]+$/, '')}.pdf`)

        URL.revokeObjectURL(url)
        setIsProcessing(false)
      }

      img.onerror = () => {
        alert('Erro ao carregar a imagem.')
        setIsProcessing(false)
        URL.revokeObjectURL(url)
      }

      img.src = url
    } catch (error) {
      console.error('Erro ao converter imagem:', error)
      alert('Erro ao converter a imagem para PDF.')
      setIsProcessing(false)
    }
  }

  const convertHtmlToPdf = async () => {
    if (!htmlContent.trim()) {
      alert('Por favor, insira algum conteúdo HTML.')
      return
    }

    setIsProcessing(true)
    try {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlContent
      tempDiv.style.width = '210mm'
      tempDiv.style.padding = '20mm'
      tempDiv.style.backgroundColor = 'white'
      document.body.appendChild(tempDiv)

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save('converted_html.pdf')
      document.body.removeChild(tempDiv)
      setIsProcessing(false)
    } catch (error) {
      console.error('Erro ao converter HTML:', error)
      alert('Erro ao converter HTML para PDF.')
      setIsProcessing(false)
    }
  }

  const convertTextToPdf = () => {
    if (!textContent.trim()) {
      alert('Por favor, insira algum texto.')
      return
    }

    setIsProcessing(true)
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const lines = pdf.splitTextToSize(textContent, 180)
      let y = 20
      const lineHeight = 7

      lines.forEach((line: string) => {
        if (y > 280) {
          pdf.addPage()
          y = 20
        }
        pdf.text(line, 15, y)
        y += lineHeight
      })

      pdf.save('converted_text.pdf')
      setIsProcessing(false)
    } catch (error) {
      console.error('Erro ao converter texto:', error)
      alert('Erro ao converter texto para PDF.')
      setIsProcessing(false)
    }
  }

  const convertDocumentToPdf = async () => {
    if (!documentFile) {
      alert('Por favor, selecione um arquivo Word.')
      return
    }

    setIsProcessing(true)
    try {
      const arrayBuffer = await documentFile.arrayBuffer()
      const result = await mammoth.convertToHtml({ arrayBuffer })
      const htmlContent = result.value

      // Create temporary div to render HTML
      const tempDiv = document.createElement('div')
      tempDiv.style.width = '210mm'
      tempDiv.style.padding = '20mm'
      tempDiv.style.backgroundColor = 'white'
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.innerHTML = htmlContent
      document.body.appendChild(tempDiv)

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const fileName = documentFile.name.replace(/\.[^/.]+$/, '')
      pdf.save(`converted_${fileName}.pdf`)
      document.body.removeChild(tempDiv)
      setIsProcessing(false)
    } catch (error) {
      console.error('Erro ao converter documento:', error)
      alert('Erro ao converter documento para PDF. Certifique-se de que o arquivo é um Word válido (.docx).')
      setIsProcessing(false)
    }
  }

  const handleConvert = () => {
    switch (conversionType) {
      case 'image':
        convertImageToPdf()
        break
      case 'document':
        convertDocumentToPdf()
        break
      case 'html':
        convertHtmlToPdf()
        break
      case 'text':
        convertTextToPdf()
        break
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setHtmlContent('')
    setTextContent('')
    setDocumentFile(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Converter para PDF</h1>
        <p className="text-gray-600">
          Transforme imagens, documentos, HTML ou texto em arquivos PDF
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Conversão
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => {
                setConversionType('image')
                resetForm()
              }}
              className={`px-4 py-3 rounded-lg font-medium transition-colors min-h-[44px] ${
                conversionType === 'image'
                  ? 'bg-orange-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Imagem
            </button>
            <button
              onClick={() => {
                setConversionType('document')
                resetForm()
              }}
              className={`px-4 py-3 rounded-lg font-medium transition-colors min-h-[44px] ${
                conversionType === 'document'
                  ? 'bg-orange-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Word
            </button>
            <button
              onClick={() => {
                setConversionType('html')
                resetForm()
              }}
              className={`px-4 py-3 rounded-lg font-medium transition-colors min-h-[44px] ${
                conversionType === 'html'
                  ? 'bg-orange-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              HTML
            </button>
            <button
              onClick={() => {
                setConversionType('text')
                resetForm()
              }}
              className={`px-4 py-3 rounded-lg font-medium transition-colors min-h-[44px] ${
                conversionType === 'text'
                  ? 'bg-orange-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Texto
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {conversionType === 'image' && (
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
                onChange={handleImageUpload}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-orange-primary outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-primary file:text-white hover:file:bg-orange-dark"
              />
              {selectedFile && (
                <div className="mt-4">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          )}

          {conversionType === 'document' && (
            <div>
              <label
                htmlFor="document-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Selecione um arquivo Word (.docx)
              </label>
              <input
                id="document-input"
                type="file"
                accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                onChange={handleDocumentUpload}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-orange-primary outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-primary file:text-white hover:file:bg-orange-dark"
              />
              {documentFile && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Arquivo selecionado:</span> {documentFile.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Tamanho: {(documentFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
            </div>
          )}

          {conversionType === 'html' && (
            <div>
              <label
                htmlFor="html-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Cole seu HTML aqui
              </label>
              <textarea
                id="html-input"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="<html>...</html>"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-orange-primary outline-none resize-none font-mono text-sm"
                rows={10}
              />
            </div>
          )}

          {conversionType === 'text' && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="text-input"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Digite ou cole seu texto
                </label>
                <textarea
                  id="text-input"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Digite seu texto aqui..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-orange-primary outline-none resize-none"
                  rows={10}
                />
              </div>
              <div>
                <label
                  htmlFor="text-file-input"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Ou faça upload de um arquivo de texto
                </label>
                <input
                  id="text-file-input"
                  type="file"
                  accept=".txt,.md"
                  onChange={handleTextFileUpload}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-orange-primary outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-primary file:text-white hover:file:bg-orange-dark"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleConvert}
              disabled={isProcessing || (conversionType === 'image' && !selectedFile) || (conversionType === 'html' && !htmlContent.trim()) || (conversionType === 'text' && !textContent.trim())}
              className="flex-1 px-6 py-3 bg-orange-primary text-white font-semibold rounded-lg hover:bg-orange-dark transition-colors focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {isProcessing ? 'Processando...' : 'Converter para PDF'}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 min-h-[44px]"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PdfConverter

