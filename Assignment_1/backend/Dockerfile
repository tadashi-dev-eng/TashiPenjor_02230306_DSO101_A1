FROM node:18-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache libstdc++ libgcc openssl

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

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
