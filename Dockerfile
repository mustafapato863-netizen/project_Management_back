# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy configuration and source files
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Production Run
FROM node:20-alpine

WORKDIR /usr/src/app

# Set environment to production
ENV NODE_ENV=production

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled JavaScript files from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose backend port
EXPOSE 8000

# Start command
CMD ["npm", "start"]
