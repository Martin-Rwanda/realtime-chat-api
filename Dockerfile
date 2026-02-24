# ─── Stage 1: Builder ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (layer caching — only reinstalls if package.json changes)
COPY package*.json ./

RUN npm ci

# Copy source code
COPY . .

# Build the NestJS app
RUN npm run build

# ─── Stage 2: Production ────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built output from builder stage
COPY --from=builder /app/dist ./dist

# Copy env example just for reference (real .env comes from environment)
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main.js"]