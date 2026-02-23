FROM node:20-bullseye

RUN apt-get update && apt-get install -y unzip curl && \
    curl -fsSL https://bun.sh/install | bash

ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

RUN bun add react-router-dom

COPY . .

EXPOSE 5173

CMD ["bun", "run", "start"]