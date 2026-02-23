FROM node:20-bullseye

WORKDIR /app

COPY . .

# Install all dependencies including @nestjs/swagger and swagger-ui-express with --legacy-peer-deps
RUN npm install --legacy-peer-deps

EXPOSE 3000

CMD ["npm", "run", "start:dev", "--", "gateway"]
