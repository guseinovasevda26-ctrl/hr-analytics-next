FROM node:20.19-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY prisma ./prisma
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

FROM node:20.19-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
