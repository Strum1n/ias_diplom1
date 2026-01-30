FROM node:22-alpine AS build
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the entire project
COPY . ./

# Build the project
RUN npm run build


# -------- Stage 2: runtime --------
FROM node:22-alpine
WORKDIR /app

# Only `.output` folder is needed from the build stage
COPY --from=build /app/.output/ ./

# Change the port and host
ENV PORT=80
ENV HOST=0.0.0.0

EXPOSE 80

CMD ["node", "/app/server/index.mjs"]