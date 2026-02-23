FROM node:20-bullseye

WORKDIR /app

COPY . .

# Install all dependencies with --legacy-peer-deps for swagger compatibility with NestJS 11
RUN npm install --legacy-peer-deps

# Install global tools
RUN npm install -g prisma@5

RUN npx prisma generate --schema=./apps/auth/prisma/schema.prisma

RUN npm run build -- auth

# Copy entrypoint script for migrations at startup
COPY ./apps/auth/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3001

# Run migrations at startup with real DATABASE_URL, then start app
CMD ["/app/entrypoint.sh"]