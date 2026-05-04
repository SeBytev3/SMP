FROM node:24-alpine AS builder

# Enable corepack and use latest npm
RUN corepack enable && corepack prepare npm@11.13.0 --activate && npm install -g npm@11.13.0

# Install system dependencies
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies
RUN npm install --loglevel error

# Copy source code and config files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:24-alpine

# Enable corepack and use latest npm
RUN corepack enable && corepack prepare npm@11.13.0 --activate && npm install -g npm@11.13.0

# Install system dependencies
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Create a non-root user and group
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Ensure permissions for the non-root user
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Expose the application port
EXPOSE 4000

# Command to run the application
CMD ["npm", "run", "start"]
