FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn prisma generate
RUN yarn build

FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# COPY --from=builder /app/package.json ./
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/prisma ./prisma
# COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["npm", "run","start"]