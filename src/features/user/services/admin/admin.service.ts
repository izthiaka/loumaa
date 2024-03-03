import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Admin } from '../../entities/admin/admin.schema';
import { Model } from 'mongoose';
import { MatriculeGenerate } from 'src/core/utils/matricule_generate/matricule_generate.util';
import BcryptImplement from 'src/core/config/bcrypt-config';
import { I18nService } from 'nestjs-i18n';
import { InjectModel } from '@nestjs/mongoose';
import {
  CreateAdminDto,
  PictureUploadDto,
  UpdateAdminDto,
  UpdateStatusAdminDto,
} from '../../dtos/admin.dto';
import { UserStatusAccount } from 'src/core/constant/user_status_account';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    private readonly matriculeGenerate: MatriculeGenerate,
    private readonly bcrypt: BcryptImplement,
    private readonly i18n: I18nService,
  ) {}

  async createAdmin(createAdminDto: CreateAdminDto): Promise<Admin> {
    try {
      if (createAdminDto.email !== null) {
        const existingAdmin = await this.adminModel
          .findOne({ email: createAdminDto.email })
          .exec();

        if (existingAdmin) {
          throw new ConflictException(
            this.i18n.t('response.ALREADY_EXIST', {
              args: { model: 'Admin', attribute: `${createAdminDto.email}` },
            }),
          );
        }
      }

      if (createAdminDto.phone) {
        const existingAdmin = await this.adminModel
          .findOne({ phone: createAdminDto.phone })
          .exec();

        if (existingAdmin) {
          throw new ConflictException(
            this.i18n.t('response.ALREADY_EXIST', {
              args: { model: 'Admin', attribute: `${createAdminDto.phone}` },
            }),
          );
        }
      }

      const passwordHash = this.bcrypt.hash('Password@123');

      const admin = new this.adminModel(createAdminDto);
      admin.matricule = this.matriculeGenerate.generate();
      admin.status = createAdminDto.status
        ? createAdminDto.status
        : UserStatusAccount.getPendingStatusLibelle();
      admin.password = passwordHash;

      return await admin.save();
    } catch (error) {
      throw Error(error);
    }
  }

  async findAllAdmins(): Promise<Admin[]> {
    try {
      return this.adminModel
        .aggregate([
          {
            $lookup: {
              from: 'roles',
              localField: 'role',
              foreignField: '_id',
              as: 'role',
            },
          },
          {
            $unwind: {
              path: '$role',
              preserveNullAndEmptyArrays: true,
            },
          },
        ])
        .exec();
    } catch (error) {
      throw Error(error);
    }
  }

  async findAdminById(id: string): Promise<Admin | null> {
    try {
      const admin = this.adminModel
        .aggregate([
          {
            $match: {
              _id: id,
            },
          },
          {
            $lookup: {
              from: 'roles',
              localField: 'role',
              foreignField: '_id',
              as: 'role',
            },
          },
          {
            $unwind: {
              path: '$role',
              preserveNullAndEmptyArrays: true,
            },
          },
        ])
        .exec();
      return admin[0];
    } catch (error) {
      throw Error(error);
    }
  }

  async findAdminByEmail(email: string): Promise<Admin | null> {
    try {
      const admin = await this.adminModel
        .aggregate([
          {
            $match: {
              email,
            },
          },
          {
            $lookup: {
              from: 'roles',
              localField: 'role',
              foreignField: '_id',
              as: 'role',
            },
          },
          {
            $unwind: {
              path: '$role',
              preserveNullAndEmptyArrays: true,
            },
          },
        ])
        .exec();
      return admin[0];
    } catch (error) {
      throw Error(error);
    }
  }

  async findAdminByMatricule(matricule: string): Promise<Admin | null> {
    try {
      const admin = await this.adminModel
        .aggregate([
          {
            $match: {
              matricule,
            },
          },
          {
            $lookup: {
              from: 'roles',
              localField: 'role',
              foreignField: '_id',
              as: 'role',
            },
          },
          {
            $unwind: {
              path: '$role',
              preserveNullAndEmptyArrays: true,
            },
          },
        ])
        .exec();
      return admin[0];
    } catch (error) {
      throw Error(error);
    }
  }

  async findAdminProfile(matricule: string): Promise<Admin | null> {
    try {
      const admin = await this.adminModel
        .aggregate([
          {
            $match: {
              matricule,
            },
          },
          {
            $lookup: {
              from: 'roles',
              localField: 'role',
              foreignField: '_id',
              as: 'role',
            },
          },
          {
            $unwind: {
              path: '$role',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'usersessions',
              localField: '_id',
              foreignField: 'user',
              as: 'sessions',
            },
          },
        ])
        .exec();
      return admin[0];
    } catch (error) {
      throw Error(error);
    }
  }

  async findAdminByPhone(phone: string): Promise<Admin | null> {
    try {
      const admin = await this.adminModel
        .aggregate([
          {
            $match: {
              phone,
            },
          },
          {
            $lookup: {
              from: 'roles',
              localField: 'role',
              foreignField: '_id',
              as: 'role',
            },
          },
          {
            $unwind: {
              path: '$role',
              preserveNullAndEmptyArrays: true,
            },
          },
        ])
        .exec();
      return admin[0];
    } catch (error) {
      throw Error(error);
    }
  }

  async findByAdminnameOrEmailOrPhone(
    identifier: string,
  ): Promise<Admin | null> {
    try {
      const admin = await this.adminModel
        .aggregate([
          {
            $match: {
              $or: [{ email: identifier }, { phone: identifier }],
            },
          },
          {
            $lookup: {
              from: 'roles',
              localField: 'role',
              foreignField: '_id',
              as: 'role',
            },
          },
          {
            $unwind: {
              path: '$role',
              preserveNullAndEmptyArrays: true,
            },
          },
        ])
        .exec();
      return admin[0];
    } catch (error) {
      throw Error(error);
    }
  }

  async updateAdmin(
    id: string,
    updateAdminDto: UpdateAdminDto,
  ): Promise<Admin | null> {
    try {
      const existingAdmin = await this.adminModel.findById(id).exec();

      if (!existingAdmin) {
        throw new NotFoundException(
          this.i18n.t('response.NOT_FOUND', {
            args: { model: 'Admin' },
          }),
        );
      }

      if (updateAdminDto.email) {
        if (
          updateAdminDto.email &&
          updateAdminDto.email !== existingAdmin.email
        ) {
          const adminWithSameEmail = await this.adminModel
            .findOne({ email: updateAdminDto.email })
            .exec();
          if (adminWithSameEmail) {
            throw new ConflictException(
              this.i18n.t('response.ALREADY_EXIST', {
                args: { model: 'Admin', attribute: `${updateAdminDto.email}` },
              }),
            );
          }
        }
      }

      if (
        updateAdminDto.phone &&
        updateAdminDto.phone !== existingAdmin.phone
      ) {
        const adminWithSamePhone = await this.adminModel
          .findOne({ phone: updateAdminDto.phone })
          .exec();
        if (adminWithSamePhone) {
          throw new ConflictException(
            this.i18n.t('response.ALREADY_EXIST', {
              args: { model: 'Admin', attribute: `${updateAdminDto.phone}` },
            }),
          );
        }
      }

      const updatedAdmin = await this.adminModel
        .findByIdAndUpdate(id, updateAdminDto, { new: true })
        .exec();

      return updatedAdmin;
    } catch (error) {
      throw Error(error);
    }
  }

  async updatePassword(
    id: string,
    updatedPassword: string,
  ): Promise<Admin | null> {
    try {
      const existingAdmin = await this.adminModel.findById(id).exec();

      if (!existingAdmin) {
        throw new NotFoundException(
          this.i18n.t('response.NOT_FOUND', {
            args: { model: 'Admin' },
          }),
        );
      }

      const updatedAdmin = await this.adminModel
        .findByIdAndUpdate(id, { password: updatedPassword }, { new: true })
        .exec();

      return updatedAdmin;
    } catch (error) {
      throw Error(error);
    }
  }

  async updateStatusAdmin(
    id: string,
    updateAdminStatusDto: UpdateStatusAdminDto,
  ): Promise<Admin | null> {
    try {
      const existingAdmin = await this.adminModel.findById(id).exec();

      if (!existingAdmin) {
        throw new NotFoundException(
          this.i18n.t('response.NOT_FOUND', {
            args: { model: 'Admin' },
          }),
        );
      }

      const updatedAdmin = await this.adminModel
        .findByIdAndUpdate(id, updateAdminStatusDto, { new: true })
        .exec();

      return updatedAdmin;
    } catch (error) {
      throw Error(error);
    }
  }

  async updateIdentifierToken(
    id: string,
    identifierToken: string,
  ): Promise<Admin | null> {
    try {
      const existingAdmin = await this.adminModel.findById(id).exec();

      if (!existingAdmin) {
        throw new NotFoundException(
          this.i18n.t('response.NOT_FOUND', {
            args: { model: 'Admin' },
          }),
        );
      }

      const updatedAdmin = await this.adminModel
        .findByIdAndUpdate(
          id,
          { identifier_token: identifierToken },
          { new: true },
        )
        .exec();

      return updatedAdmin;
    } catch (error) {
      throw Error(error);
    }
  }

  async updatePictureAdmin(
    id: string,
    uploadPictureDto: PictureUploadDto,
  ): Promise<Admin | null> {
    try {
      const existingAdmin = await this.adminModel.findById(id).exec();

      if (!existingAdmin) {
        throw new NotFoundException(
          this.i18n.t('response.NOT_FOUND', {
            args: { model: 'Admin' },
          }),
        );
      }

      const updatedAdmin = await this.adminModel
        .findByIdAndUpdate(id, uploadPictureDto, { new: true })
        .exec();

      if (existingAdmin.photo) {
        // Delete full path image in server folder
      }

      return updatedAdmin;
    } catch (error) {
      throw Error(error);
    }
  }

  async deleteAdmin(id: string): Promise<Admin | null> {
    try {
      return this.adminModel.findByIdAndDelete(id).exec();
    } catch (error) {
      throw Error(error);
    }
  }

  async searchAdmin(search: string): Promise<Admin[]> {
    try {
      return this.adminModel
        .aggregate([
          {
            $lookup: {
              from: 'roles',
              localField: 'role',
              foreignField: '_id',
              as: 'role',
            },
          },
          {
            $unwind: {
              path: '$role',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              $or: [
                { email: { $regex: `${search}`, $options: 'i' } },
                { phone: { $regex: `${search}`, $options: 'i' } },
                { name: { $regex: `${search}`, $options: 'i' } },
                { status: { $regex: `${search}`, $options: 'i' } },
                {
                  matricule: {
                    $regex: `${search}`,
                    $options: 'i',
                  },
                },
                { 'role.name': { $regex: `${search}`, $options: 'i' } },
              ],
            },
          },
        ])
        .exec();
    } catch (error) {
      throw Error(error);
    }
  }

  async findAdminByToken(token: string): Promise<Admin | null> {
    try {
      const admin = await this.adminModel
        .aggregate([
          {
            $lookup: {
              from: 'roles',
              localField: 'role',
              foreignField: '_id',
              as: 'role',
            },
          },
          {
            $unwind: {
              path: '$role',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'usersessions',
              localField: '_id',
              foreignField: 'user',
              as: 'sessions',
            },
          },
          {
            $match: {
              'sessions.token': token,
            },
          },
        ])
        .exec();

      return admin[0];
    } catch (error) {
      throw Error(error);
    }
  }
}
