import { NestFactory } from '@nestjs/core';
import { FriendsModule } from './friends.module';

async function bootstrap() {
  const app = await NestFactory.create(FriendsModule);
  await app.listen(process.env.port ?? 3003);
}
bootstrap();
