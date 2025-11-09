# syntax=docker/dockerfile:1

FROM node:22-alpine AS dev

#first setup pnpm and corepack
RUN apk add --no-cache bash curl git

WORKDIR /app

# Enable Corepack to manage package managers like pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

COPY . .

# Expose the port your frontend app listens on
EXPOSE 5173

# Run Vite dev server
CMD ["pnpm", "run", "dev"]

