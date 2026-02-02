FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy source files
COPY src ./src
COPY public ./public
COPY tsconfig.json webpack.config.cjs ./

# Expose port
EXPOSE 8080 5000

# Start dev server
CMD ["bun", "run", "dev"]
