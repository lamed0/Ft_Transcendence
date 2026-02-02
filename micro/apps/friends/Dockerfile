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
RUN npx prisma generate --schema=./apps/friends/prisma/schema.prisma

# Build the friends application
RUN npm run build -- friends

# Expose port 3003 for friends service
EXPOSE 3003

# Start the friends service
CMD ["sh", "-c", "node dist/apps/friends/main.js"]
