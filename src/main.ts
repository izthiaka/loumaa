import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT);
  const url = await app.getUrl();
  console.log(`Application is running on: ${url}`);
  // log(`listening on PORT ${PORT}`);
}
bootstrap();
