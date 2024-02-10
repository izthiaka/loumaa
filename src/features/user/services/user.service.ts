import { Model } from 'mongoose';
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../entities/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import MatriculeGenerate from 'src/core/utils/matricule_generate';
import {
  CreateUserDto,
  PictureUploadDto,
  UpdateStatusUserDto,
  UpdateUserDto,
} from '../dtos/user.dto';
import UserStatusAccount from 'src/core/constant/user_status_account';
import BcryptImplement from 'src/core/config/bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly matriculeGenerate: MatriculeGenerate,
    private readonly bcrypt: BcryptImplement,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      if (createUserDto.email !== null) {
        const existingUser = await this.userModel
          .findOne({ email: createUserDto.email })
          .exec();

        if (existingUser) {
          throw new ConflictException(
            `L'utilisateur avec l'email [${createUserDto.email}] existe déjà.`,
          );
        }
      }

      if (createUserDto.phone) {
        const existingUser = await this.userModel
          .findOne({ phone: createUserDto.phone })
          .exec();

        if (existingUser) {
          throw new ConflictException(
            `L'utilisateur avec le numéro de téléphone [${createUserDto.phone}] existe déjà.`,
          );
        }
      }

      const passwordHash = this.bcrypt.hash('Password@123');

      const user = new this.userModel(createUserDto);
      user.matricule = this.matriculeGenerate.generate();
      user.status = createUserDto.status
        ? createUserDto.status
        : UserStatusAccount.getPendingStatusLibelle();
      user.password = passwordHash;

      return await user.save();
    } catch (error) {
      throw Error(error);
    }
  }

  async findAllUsers(): Promise<User[]> {
    try {
      return this.userModel
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

  async findUserById(id: string): Promise<User | null> {
    try {
      const user = this.userModel
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
      return user[0];
    } catch (error) {
      throw Error(error);
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.userModel
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
      return user[0];
    } catch (error) {
      throw Error(error);
    }
  }

  async findUserByMatricule(matricule: string): Promise<User | null> {
    try {
      const user = await this.userModel
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
      return user[0];
    } catch (error) {
      throw Error(error);
    }
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    try {
      const user = await this.userModel
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
      return user[0];
    } catch (error) {
      throw Error(error);
    }
  }

  async findByUsernameOrEmailOrPhone(identifier: string): Promise<User | null> {
    try {
      const user = await this.userModel
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
      return user[0];
    } catch (error) {
      throw Error(error);
    }
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    try {
      const existingUser = await this.userModel.findById(id).exec();

      if (!existingUser) {
        throw new NotFoundException(
          `Utilisateur avec l'ID [${id}] non trouvé.`,
        );
      }

      if (updateUserDto.email) {
        if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
          const userWithSameEmail = await this.userModel
            .findOne({ email: updateUserDto.email })
            .exec();
          if (userWithSameEmail) {
            throw new ConflictException(
              `L'e-mail [${updateUserDto.email}] est déjà utilisé par un autre utilisateur.`,
            );
          }
        }
      }

      if (updateUserDto.phone && updateUserDto.phone !== existingUser.phone) {
        const userWithSamePhone = await this.userModel
          .findOne({ phone: updateUserDto.phone })
          .exec();
        if (userWithSamePhone) {
          throw new ConflictException(
            `Le numéro de téléphone [${updateUserDto.phone}] est déjà utilisé par un autre utilisateur.`,
          );
        }
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .exec();

      return updatedUser;
    } catch (error) {
      throw Error(error);
    }
  }

  async updateStatusUser(
    id: string,
    updateUserStatusDto: UpdateStatusUserDto,
  ): Promise<User | null> {
    try {
      const existingUser = await this.userModel.findById(id).exec();

      if (!existingUser) {
        throw new NotFoundException(
          `Utilisateur avec l'ID [${id}] non trouvé.`,
        );
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserStatusDto, { new: true })
        .exec();

      return updatedUser;
    } catch (error) {
      throw Error(error);
    }
  }

  async updatePictureUser(
    id: string,
    uploadPictureDto: PictureUploadDto,
  ): Promise<User | null> {
    try {
      const existingUser = await this.userModel.findById(id).exec();

      if (!existingUser) {
        throw new NotFoundException(
          `Utilisateur avec l'ID [${id}] non trouvé.`,
        );
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, uploadPictureDto, { new: true })
        .exec();

      if (existingUser.photo) {
        // Delete full path image in server folder
      }

      return updatedUser;
    } catch (error) {
      throw Error(error);
    }
  }

  async deleteUser(id: string): Promise<User | null> {
    try {
      return this.userModel.findByIdAndDelete(id).exec();
    } catch (error) {
      throw Error(error);
    }
  }

  async searchUser(search: string): Promise<User[]> {
    try {
      return this.userModel
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
}
