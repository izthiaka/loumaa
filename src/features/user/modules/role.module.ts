import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from '../entities/role.schema';
import { RoleController } from '../controllers/role.controller';
import { RoleService } from '../services/role.service';
import MatriculeGenerate from 'src/core/utils/matricule_generate';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
  controllers: [RoleController],
  providers: [RoleService, MatriculeGenerate],
  exports: [RoleService, MongooseModule],
})
export class RoleModule {}
