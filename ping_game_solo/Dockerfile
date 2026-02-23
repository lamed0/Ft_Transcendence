FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
#install curl for health check
RUN apt-get update && apt-get install -y curl
# Install dependencies
RUN bun install

# Copy source files
COPY src ./src
COPY public ./public
COPY tsconfig.json webpack.config.cjs ./

# Expose port
EXPOSE 8083 5002

# Start dev server
CMD ["bun", "run", "dev"]
