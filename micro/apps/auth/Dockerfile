FROM node:20-bullseye

# Set working directory to match the monorepo root (micro folder)
WORKDIR /app

# Copy the entire workspace
COPY . .

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate --schema=./apps/auth/prisma/schema.prisma

# Build the auth application
RUN npm run build -- auth

# Expose port 3001 for auth service
EXPOSE 3001

# Start the auth service with migrations
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./apps/auth/prisma/schema.prisma && node dist/apps/auth/main.js"]