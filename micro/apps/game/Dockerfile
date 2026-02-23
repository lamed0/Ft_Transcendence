FROM node:20-bullseye

WORKDIR /app

COPY . .

# Install all dependencies (including dev for build)
RUN npm install --legacy-peer-deps

# Install global tools
RUN npm install -g prisma@5

# Install postgresql-client for schema creation
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

RUN npx prisma generate --schema=./apps/game/prisma/schema.prisma

# Build the app
RUN npm run build -- game

COPY ./apps/game/init-schema.sh /app/init-schema.sh
RUN chmod +x /app/init-schema.sh

EXPOSE 3004

CMD ["sh", "-c", "echo 'Starting game service...' && /app/init-schema.sh && echo 'Running migrations...' && npx prisma migrate deploy --schema=./apps/game/prisma/schema.prisma && echo 'Port check:' && sleep 2 && exec node dist/apps/game/main.js"]
