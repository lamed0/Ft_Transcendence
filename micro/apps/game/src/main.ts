import { NestFactory } from '@nestjs/core';
import { GameModule } from './game.module';
import cookieParser from 'cookie-parser';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(GameModule);
  
  const corsOptions = {
    origin: [
      process.env.FRONTEND_URL ?? 'https://localhost',
      'http://localhost:5173',
      'https://localhost:5173',
      process.env.AUTH_URL ?? 'http://auth:3001',
      process.env.GAME_URL ?? 'http://game:3005',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-service-key'],
  };

  app.enableCors(corsOptions);
  app.use(cookieParser());
  app.useWebSocketAdapter(new IoAdapter(app));
  
  await app.listen(process.env.PORT ?? 3005, '0.0.0.0');
}
bootstrap();
