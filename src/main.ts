import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as moment from 'moment';

import { NestExpressApplication } from '@nestjs/platform-express';
import { ForbiddenExceptionFilter } from './core/responses/forbidden-exception.filter';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new I18nValidationPipe({ transform: true }));
  app.useGlobalFilters(
    new ForbiddenExceptionFilter(),
    new I18nValidationExceptionFilter({
      detailedErrors: false,
    }),
  );

  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT);
  moment.locale('fr');
}
bootstrap();
