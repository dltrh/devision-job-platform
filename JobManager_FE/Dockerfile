# ========================================
# Multi-stage Dockerfile for JobManager Frontend
# Stage 1: Build the React application
# Stage 2: Serve with Nginx
# ========================================

# ========================================
# Stage 1: Build
# ========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build arguments for environment variables
ARG VITE_API_BASE_URL
ARG VITE_API_URL
ARG VITE_GATEWAY_API_URL
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_NODE_ENV=production
ARG VITE_ENV=production
ARG VITE_ENABLE_MOCK_API=false

# Set environment variables for build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_GATEWAY_API_URL=${VITE_GATEWAY_API_URL}
ENV VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY}
ENV VITE_NODE_ENV=${VITE_NODE_ENV}
ENV VITE_ENV=${VITE_ENV}
ENV VITE_ENABLE_MOCK_API=${VITE_ENABLE_MOCK_API}

# Build the application
RUN npm run build

# ========================================
# Stage 2: Production with Nginx
# ========================================
FROM nginx:alpine AS production

# Install envsubst for runtime environment variable substitution
RUN apk add --no-cache gettext

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy nginx configuration and template
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create a script to substitute environment variables at runtime
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose ports
EXPOSE 80
EXPOSE 443

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost/ || exit 1

# Start nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
