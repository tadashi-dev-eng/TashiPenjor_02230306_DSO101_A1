FROM node:20-alpine

WORKDIR /app

# Install runtime + build dependencies (needed for native modules like better-sqlite3)
RUN apk add --no-cache libstdc++ libgcc openssl python3 make g++ build-base \
  && ln -sf /usr/bin/python3 /usr/bin/python

# Copy package files first (for caching)
COPY package*.json ./

# Copy Prisma schema early so `npm install` (postinstall) can run prisma generate
COPY prisma ./prisma/

# Install dependencies (runs `postinstall` which triggers prisma generate)
RUN npm install

# Copy source and config
COPY tsconfig.json ./
COPY src ./src/

# Build TypeScript
RUN npm run build

# Copy everything else
COPY . .

# Expose port
EXPOSE 3001

CMD ["node", "dist/index.js"]
