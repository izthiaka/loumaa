import { Module } from '@nestjs/common';
import { AdminService } from '../services/admin/admin.service';
import { AdminController } from '../controllers/admin/admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from '../entities/admin/admin.schema';
import { MatriculeGenerate } from 'src/core/utils/matricule_generate/matricule_generate.util';
import { RoleService } from '../services/role/role.service';
import BcryptImplement from 'src/core/config/bcrypt-config';
import { RoleModule } from './role.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    RoleModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, RoleService, MatriculeGenerate, BcryptImplement],
  exports: [AdminService, MongooseModule],
})
export class AdminModule {}
