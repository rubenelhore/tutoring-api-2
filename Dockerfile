# Build stage (compile TypeScript)
FROM node:20-slim as builder

WORKDIR /app

# Copy dependencies
COPY package*.json ./

# Install (including devDependencies to compile)
RUN npm ci

# Copy source code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# ============ Runtime stage (execute) ============

FROM node:20-slim

WORKDIR /app

# Copy package.json to install only production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist

# Environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Execute
CMD ["node", "dist/index.js"]
