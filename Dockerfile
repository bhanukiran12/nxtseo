# Standalone NxtSEO (use docker-compose instead!)
FROM node:20-alpine

WORKDIR /app

# Client deps & build
COPY client/package*.json ./client/
RUN cd client && npm ci && cd ..

# Server deps
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production && cd ..

# Copy code
COPY . .

# Build client
RUN cd client && npm run build

EXPOSE 5000
CMD ["sh", "-c", "cd server && npm start"]


