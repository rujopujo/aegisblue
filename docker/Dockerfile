# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy frontend dependency manifests
COPY frontend/package*.json ./

# Install dependencies cleanly
RUN npm install

# Copy frontend source code
COPY frontend/ ./

# Build production bundle
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine

# Copy custom Nginx SPA configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
