# Dockerfile
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Build if TypeScript
RUN npm run build

# Default command (will be overridden in docker-compose)
CMD ["node", "dist/index.js"]
