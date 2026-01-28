FROM node:20-bullseye

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma
COPY .env ./

RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3000

CMD sh -c "npx prisma migrate deploy && npm run start:dev"
# CMD ["npm", "run", "start:dev"]

