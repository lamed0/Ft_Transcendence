import { NestFactory } from '@nestjs/core';
import { FriendsModule } from './friends.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(FriendsModule);
  
  app.use(cookieParser());
  
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'https://localhost',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  await app.listen(process.env.port ?? 3003, '0.0.0.0');
}
bootstrap();
