import { Injectable } from '@nestjs/common';
import { Role } from '../schemas/role.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}

  async createRole(roleData: Role): Promise<Role> {
    const newRole = new this.roleModel(roleData);
    return newRole.save();
  }

  async findAllRoles(): Promise<Role[]> {
    return this.roleModel.find().exec();
  }

  async findRoleById(id: string): Promise<Role | null> {
    return this.roleModel.findById(id).exec();
  }

  async findRoleByName(name: string): Promise<Role | null> {
    return this.roleModel.findOne({ name }).exec();
  }

  async findRoleByNameOrCode(name: string, code: string): Promise<Role | null> {
    return this.roleModel.findOne({ $or: [{ name }, { code }] }).exec();
  }

  async findRoleByCode(code: string): Promise<Role | null> {
    return this.roleModel.findOne({ code }).exec();
  }

  async updateRole(id: string, roleData: Role): Promise<Role | null> {
    return this.roleModel.findByIdAndUpdate(id, roleData, { new: true }).exec();
  }

  async deleteRole(id: string): Promise<Role | null> {
    return this.roleModel.findByIdAndDelete(id).exec();
  }
}
