import { Injectable } from '@nestjs/common';
import { Role } from '../schemas/role.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateRoleDto, UpdateRoleDto } from '../dtos/role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}

  async createRole(roleData: CreateRoleDto): Promise<Role> {
    try {
      const newRole = new this.roleModel(roleData);
      return newRole.save();
    } catch (error) {
      throw Error(error);
    }
  }

  async findAllRoles(): Promise<Role[]> {
    try {
      return this.roleModel.find().exec();
    } catch (error) {
      throw Error(error);
    }
  }

  async findRoleById(id: string): Promise<Role | null> {
    try {
      return this.roleModel.findById(id).exec();
    } catch (error) {
      throw Error(error);
    }
  }

  async findRoleByName(name: string): Promise<Role | null> {
    try {
      return this.roleModel.findOne({ name }).exec();
    } catch (error) {
      throw Error(error);
    }
  }

  async findRoleByNameOrCode(name: string, code: string): Promise<Role | null> {
    try {
      return this.roleModel.findOne({ $or: [{ name }, { code }] }).exec();
    } catch (error) {
      throw Error(error);
    }
  }

  async findRoleByCode(code: string): Promise<Role | null> {
    try {
      return this.roleModel.findOne({ code }).exec();
    } catch (error) {
      throw Error(error);
    }
  }

  async updateRole(id: string, roleData: UpdateRoleDto): Promise<Role | null> {
    try {
      return this.roleModel
        .findByIdAndUpdate(id, roleData, { new: true })
        .exec();
    } catch (error) {
      throw Error(error);
    }
  }

  async deleteRole(id: string): Promise<Role | null> {
    try {
      return this.roleModel.findByIdAndDelete(id).exec();
    } catch (error) {
      throw Error(error);
    }
  }

  async searchRole(search: string): Promise<Role[]> {
    try {
      return this.roleModel
        .aggregate([
          {
            $match: {
              $or: [
                { name: { $regex: `${search}`, $options: 'i' } },
                { code: { $regex: `${search}`, $options: 'i' } },
              ],
            },
          },
        ])
        .exec();
    } catch (error) {
      throw Error(error);
    }
  }
}
