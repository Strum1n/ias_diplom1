FROM node:22-alpine AS build

ENV NODE_OPTIONS="--max-old-space-size=8192"
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Используем минимальный образ
FROM node:22-alpine

WORKDIR /app

# Копируем только собранные файлы
COPY --from=build /app/.output ./.output

ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]