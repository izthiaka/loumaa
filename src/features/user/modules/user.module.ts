import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from '../controllers/user/user.controller';
import { User, UserSchema } from '../entities/user/user.schema';
import { UserService } from '../services/user/user.service';
import { MatriculeGenerate } from 'src/core/utils/matricule_generate/matricule_generate.util';
import { RoleService } from '../services/role/role.service';
import { RoleModule } from './role.module';
import BcryptImplement from 'src/core/config/bcrypt-config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RoleModule,
  ],
  controllers: [UserController],
  providers: [UserService, RoleService, MatriculeGenerate, BcryptImplement],
  exports: [UserService, MongooseModule],
})
export class UserModule {}
