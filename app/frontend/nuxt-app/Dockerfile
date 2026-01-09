# Используем официальный Node.js образ
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем все файлы проекта
COPY . .

# Собираем Nuxt 3 проект
RUN npm run build

# Команда запуска приложения
CMD ["npx", "nuxi", "preview", "--port", "3000", "--hostname", "0.0.0.0"]