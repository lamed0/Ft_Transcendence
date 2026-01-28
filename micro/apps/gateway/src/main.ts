import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);

  // auth service
  app.use('/auth', createProxyMiddleware({
    target: process.env.AUTH_URL ?? 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: {
      '^': '/auth',
    },
  }));

  // users endpoints (if inside auth for now)
  app.use('/users', createProxyMiddleware({
    target: process.env.AUTH_URL ?? 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: {
      '^': '/users',
    },
  }));

  // friends
  app.use('/friends', createProxyMiddleware({
    target: process.env.FRIENDS_URL ?? 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: {
      '^': '/friends',
    },
  }));

  // game
  app.use('/game', createProxyMiddleware({
    target: process.env.GAME_URL ?? 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: {
      '^': '/game',
    },
    ws: true, // important for websockets
  }));

  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  await app.listen(3000);
}
bootstrap();
