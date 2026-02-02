FROM node:20-bullseye

# Set working directory to match the monorepo root (micro folder)
WORKDIR /app

# Copy the entire workspace
COPY . .

# Install dependencies
RUN npm install

# Install Prisma CLI v5 globally for team access
RUN npm install -g prisma@5

# Generate Prisma client
RUN npx prisma generate --schema=./apps/game/prisma/schema.prisma

# Build the game application
RUN npm run build -- game

# Expose port 3002 for game service
EXPOSE 3002

# Start the game service with migrations
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./apps/game/prisma/schema.prisma && node dist/apps/game/main.js"]
