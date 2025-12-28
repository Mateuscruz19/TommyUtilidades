#!/bin/bash
# Script para configurar Python 3.12 para o youtube-dl-exec

echo "🔧 Configurando Python 3.12 para o servidor..."

# Remove o youtube-dl-exec atual
echo "📦 Removendo youtube-dl-exec antigo..."
rm -rf node_modules/youtube-dl-exec

# Configura variável de ambiente para usar Python 3.12
export PYTHON=/opt/homebrew/bin/python3.12

# Reinstala o youtube-dl-exec
echo "📦 Reinstalando youtube-dl-exec com Python 3.12..."
npm install youtube-dl-exec

echo "✅ Configuração concluída!"
echo ""
echo "Agora execute: npm run dev:api"

