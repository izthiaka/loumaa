import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import appConfig from './core/config/app.config';
import appConfigProduction from './core/config/app.config.production';
import databaseConfig from './core/config/database.config';
import { Role, RoleSchema } from './user/schemas/role.schema';
import { RoleService } from './user/services/role.service';
import { RoleController } from './user/controllers/role.controller';
import MatriculeGenerate from './core/utils/matricule_generate';

@Module({
  imports: [
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
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
  controllers: [RoleController],
  providers: [RoleService, MatriculeGenerate],
})
export class AppModule {}
