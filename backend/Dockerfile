FROM node:20-bullseye

WORKDIR /app

COPY package*.json ./

RUN npm install

# Install Prisma CLI v5 globally for team access
RUN npm install -g prisma@5

COPY prisma ./prisma
COPY .env ./

RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3000

CMD sh -c "npx prisma migrate deploy && npm run start:dev"
# CMD ["npm", "run", "start:dev"]

