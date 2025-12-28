FROM node:18-alpine

# Install Python and yt-dlp dependencies
RUN apk add --no-cache python3 py3-pip ffmpeg && \
    pip3 install --no-cache-dir yt-dlp

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using --omit=dev instead of --only=production)
RUN npm ci --omit=dev

# Copy server file
COPY server.mjs ./

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.mjs"]

