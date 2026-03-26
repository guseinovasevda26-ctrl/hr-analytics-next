FROM node:20.19-alpine

WORKDIR /app

COPY package.json ./
COPY prisma ./prisma
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

CMD sh -c "npx prisma db push --skip-generate && node lib/seed.mjs 2>/dev/null; node .next/standalone/server.js"
