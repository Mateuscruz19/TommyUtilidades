import React from 'react'
import ToolCard from '../components/UI/ToolCard'

const Home: React.FC = () => {
  const tools = [
    {
      title: 'Download de Vídeos',
      description: 'Baixe vídeos do YouTube, Instagram e Twitter/X',
      path: '/video-download',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Converter para PDF',
      description: 'Transforme imagens, documentos, HTML e texto em PDF',
      path: '/pdf-converter',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Comprimir Imagens',
      description: 'Reduza o tamanho das suas imagens mantendo a qualidade',
      path: '/image-compressor',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Gerador de QR Code',
      description: 'Crie QR Codes personalizados para links, textos e mais',
      path: '/qr-generator',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <img 
            src="/images/logo.png" 
            alt="Tommy Utilidades" 
            className="h-24 w-auto"
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Bem-vindo ao Tommy Utilidades
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Ferramentas úteis e práticas para facilitar o seu dia a dia. 
          Tudo em um só lugar, rápido e fácil de usar!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <ToolCard
            key={tool.path}
            title={tool.title}
            description={tool.description}
            path={tool.path}
            icon={tool.icon}
          />
        ))}
      </div>
    </div>
  )
}

export default Home

