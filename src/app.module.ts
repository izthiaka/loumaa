import { AppService } from './app.service';
import { AppController } from './app.controller';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import appConfig from './core/config/app.config';
import appConfigProduction from './core/config/app.config.production';
import databaseConfig from './core/config/database.config';
import { Role, RoleSchema } from './modules/user/schemas/role.schema';
import { RoleService } from './modules/user/services/role.service';
import { RoleController } from './modules/user/controllers/role.controller';
import { UserController } from './modules/user/controllers/user.controller';
import MatriculeGenerate from './core/utils/matricule_generate';
import { UserService } from './modules/user/services/user.service';
import { User, UserSchema } from './modules/user/schemas/user.schema';

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
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AppController, RoleController, UserController],
  providers: [AppService, RoleService, UserService, MatriculeGenerate],
})
export class AppModule {}
