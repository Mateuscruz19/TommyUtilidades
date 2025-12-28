# Guia de Deploy - Tommy Utilidades

## ⚠️ Importante sobre Downloads de Vídeo

As **Serverless Functions do Vercel não são ideais** para downloads de vídeo devido a:

1. **Timeout limitado**: 10 segundos (plano gratuito) ou 60 segundos (Pro)
2. **Limite de tamanho de resposta**: Não adequado para vídeos grandes
3. **Custo**: Streaming de vídeos pode consumir muitos recursos

## Soluções Recomendadas

### Opção 1: Servidor Dedicado (✅ Implementado)

O projeto está configurado para deploy em servidor dedicado. O `server.mjs` pode ser deployado em:

#### Railway (Recomendado - Grátis)
1. Crie conta em [railway.app](https://railway.app)
2. Conecte seu repositório GitHub
3. Railway detectará automaticamente o `server.mjs`
4. Configure a variável `PORT` (Railway define automaticamente)
5. Copie a URL do deploy (ex: `https://tommy-api.railway.app`)
6. No Vercel (frontend), configure: `VITE_API_URL=https://tommy-api.railway.app`

#### Render
1. Crie conta em [render.com](https://render.com)
2. Crie novo "Web Service"
3. Conecte seu repositório
4. Configurações:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.mjs`
   - **Environment**: Adicione `PORT=10000` (Render usa porta dinâmica)
5. Copie a URL e configure no frontend

#### Docker
```bash
# Build
docker build -t tommy-utilidades-api .

# Run
docker run -p 3000:3000 -e PORT=3000 tommy-utilidades-api
```

#### VPS Próprio
```bash
# Instale Node.js 18+
# Clone o repositório
git clone <seu-repo>
cd tommy-utilidades
npm install --production

# Use PM2 para gerenciar o processo
npm install -g pm2
pm2 start server.mjs --name tommy-api
pm2 save
pm2 startup
```

### Opção 2: API Externa
Use APIs externas especializadas em download de vídeos:
- yt-dlp-api (self-hosted)
- Outras APIs públicas (verificar termos de uso)

### Opção 3: Apenas Funcionalidades Client-Side
Remova as funcionalidades de download de vídeo e mantenha apenas:
- ✅ Gerador de QR Code
- ✅ Conversor PDF
- ✅ Compressão de Imagens

Essas funcionam 100% no navegador e não precisam de backend.

## Deploy no Vercel

Para deploy apenas do frontend (sem downloads de vídeo):

1. Remova ou ignore as pastas `api/` e `server.mjs`
2. Deploy normalmente no Vercel
3. Todas as funcionalidades client-side funcionarão perfeitamente

## Deploy Completo (Frontend + Backend) - ✅ Opção Escolhida

### Passo 1: Deploy do Backend
Siga as instruções acima para deploy do `server.mjs` em Railway, Render ou similar.

### Passo 2: Deploy do Frontend no Vercel
1. Conecte seu repositório ao Vercel
2. Configure a variável de ambiente:
   - **Nome**: `VITE_API_URL`
   - **Valor**: URL do seu servidor backend (ex: `https://tommy-api.railway.app`)
3. Deploy automático

### Passo 3: Teste
1. Acesse o site deployado
2. Teste o download de vídeos do YouTube
3. Verifique se está conectando ao backend corretamente

## Correções Implementadas

✅ **Atualizado ytdl-core**: Migrado para `@distube/ytdl-core` (versão mais estável)
✅ **Retry Logic**: Sistema de tentativas para lidar com erros temporários do YouTube
✅ **Headers Customizados**: User-Agent customizado para evitar bloqueios
✅ **Tratamento de Erros**: Mensagens de erro em português e mais informativas
✅ **Configuração de Porta**: Suporte a variável `PORT` para diferentes plataformas

