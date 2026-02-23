import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);

  // // Enable Socket.io adapter
  // app.useWebSocketAdapter(new IoAdapter(app));

  // Enable CORS FIRST
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'https://localhost',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-internal-token'],
    exposedHeaders: ['Content-Type'],
  });

  // Setup Swagger documentation for public API
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Transcendence Public API')
    .setDescription('Public API for Transcendence game platform with API key authentication')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .addTag('Public API', 'Public endpoints requiring API key')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  // Mount Swagger at /docs inside the gateway. NGINX rewrites /api/docs -> /docs,
  // so the public URL exposed to the browser remains /api/docs.
  SwaggerModule.setup('docs', app, document);

  // Parse cookies AFTER CORS
  app.use(cookieParser());

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
    target: process.env.GAME_SERVICE_URL ?? 'http://game:3005',
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
