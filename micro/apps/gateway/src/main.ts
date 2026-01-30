import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // auth service
  app.use('/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL ?? 'http://auth:3001',
    changeOrigin: true,
    pathRewrite: {
      '^': '/auth',
    },
  }));

  // users endpoints (if inside auth for now)
  app.use('/users', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL ?? 'http://auth:3001',
    changeOrigin: true,
    pathRewrite: {
      '^': '/users',
    },
  }));

  // friends
  app.use('/friends', createProxyMiddleware({
    target: process.env.FRIENDS_SERVICE_URL ?? 'http://friends:3003',
    changeOrigin: true,
    pathRewrite: {
      '^': '/friends',
    },
  }));

  // game
  app.use('/game', createProxyMiddleware({
    target: process.env.GAME_SERVICE_URL ?? 'http://game:3004',
    changeOrigin: true,
    pathRewrite: {
      '^': '/game',
    },
    ws: true, // important for websockets
  }));

  // API prefix routes (for frontend via vite proxy)
  app.use('/api/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '/auth',
    },
  }));

  app.use('/api/users', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: {
      '^/api/users': '/users',
    },
  }));

  app.use('/api/friends', createProxyMiddleware({
    target: process.env.FRIENDS_SERVICE_URL ?? 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: {
      '^/api/friends': '/friends',
    },
  }));

  app.use('/api/game', createProxyMiddleware({
    target: process.env.GAME_SERVICE_URL ?? 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: {
      '^/api/game': '/game',
    },
    ws: true,
  }));

  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  await app.listen(3000);
}
bootstrap();
