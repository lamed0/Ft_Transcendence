FROM node:20-bullseye

WORKDIR /app

COPY . .

# Install all dependencies with --legacy-peer-deps for swagger compatibility
RUN npm install --legacy-peer-deps

# Install global tools
RUN npm install -g prisma@5

RUN npx prisma generate --schema=./apps/friends/prisma/schema.prisma

EXPOSE 3003

CMD ["sh", "-c", "npx prisma migrate deploy --schema=./apps/friends/prisma/schema.prisma && npm run start:dev -- friends"]
