import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import appConfig from './core/config/app.config';
import appConfigProduction from './core/config/app.config.production';
import databaseConfig from './core/config/database.config';
import { UserModule } from './features/user/modules/user.module';
import { RoleModule } from './features/user/modules/role.module';
import { AuthModule } from './features/auth/auth.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..'),
    }),
    ConfigModule.forRoot({
      load: [appConfig, appConfigProduction, databaseConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('uri'),
      }),
      inject: [ConfigService],
    }),
    RoleModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
