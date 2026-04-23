# Standalone NxtSEO Dockerfile (dev mode)
FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json client/package*.json server/package*.json ./

# Install deps
RUN npm install && cd client && npm install && cd ../server && npm install

# Copy source
COPY . .

# Expose ports
EXPOSE 80 5000 27017

# Multi-process with wait script
CMD ["sh", "-c", "\
  docker-entrypoint.sh mongod --bind_ip_all & \
  sleep 10 && \
  cd server && npm start & \
  cd ../client && npm run dev"]

