import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as moment from 'moment';

import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ForbiddenExceptionFilter } from './core/responses/forbidden-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new ForbiddenExceptionFilter());

  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT);
  const url = await app.getUrl();
  moment.locale('fr');
  console.log(`Application is running on: ${url}`);
}
bootstrap();
