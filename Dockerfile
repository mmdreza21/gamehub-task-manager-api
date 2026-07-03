# -------------------------
# Build Stage
# -------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source
COPY . .

# Generate Prisma Client
RUN yarn prisma generate

# Build NestJS
RUN yarn build

# -------------------------
# Production Stage
# -------------------------
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy application
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/main.js"]