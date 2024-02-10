import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from '../controllers/user.controller';
import { User, UserSchema } from '../entities/user.schema';
import { UserService } from '../services/user.service';
import MatriculeGenerate from 'src/core/utils/matricule_generate';
import { RoleService } from '../services/role.service';
import { RoleModule } from './role.module';
import BcryptImplement from 'src/core/config/bcrypt';

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
