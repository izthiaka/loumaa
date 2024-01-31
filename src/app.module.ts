import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import appConfigProduction from './config/app.config.production';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig, appConfigProduction],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
