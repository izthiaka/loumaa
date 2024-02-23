import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import appConfig from './core/config/app-config';
import MongooseConfig from './core/config/database-config';
import { UserModule } from './features/user/modules/user.module';
import { RoleModule } from './features/user/modules/role.module';
import { AuthModule } from './features/auth/auth.module';
import { validationSchema } from './core/config/env/validation';
import { configEnv } from './core/config/env/configEnv';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..'),
    }),
    ConfigModule.forRoot({
      envFilePath: configEnv(process.env.NODE_ENV),
      isGlobal: true,
      load: [appConfig, MongooseConfig],
      validationSchema,
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
