FROM node:20-bullseye

# Set working directory to match the monorepo root (micro folder)
WORKDIR /app

# Copy the entire workspace
COPY . .

# Install dependencies
RUN npm install

# Build the gateway application
RUN npm run build -- gateway

# Expose port 3000 for gateway
EXPOSE 3000

# Start the gateway service
CMD ["node", "dist/apps/gateway/main.js"]
