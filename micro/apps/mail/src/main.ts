import { NestFactory } from '@nestjs/core';
import { MailModule } from './mail.module';

async function bootstrap() {
  const app = await NestFactory.create(MailModule);
  await app.listen(process.env.port ?? 3005);
}
bootstrap();
