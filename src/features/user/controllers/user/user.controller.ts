import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  HttpStatus,
  HttpCode,
  ConflictException,
  UseInterceptors,
  Query,
  UploadedFile,
} from '@nestjs/common';
import { User } from '../../entities/user/user.schema';
import { UserService } from '../../services/user/user.service';
import {
  CreateUserDto,
  PictureUploadDto,
  UpdateStatusUserDto,
  UpdateUserDto,
  UserSpecificFieldDto,
} from '../../dtos/user.dto';
import { RoleService } from '../../services/role/role.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/core/config/multer-config';
import { Request } from 'express';

const staticUrlImage = 'images';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
  ) {}

  @Post('store')
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ message: string; status: number; data?: User }> {
    try {
      const role = await this.roleService.findRoleByCode(createUserDto.role);
      if (!role) {
        return {
          message: `The role [${createUserDto.role}] does not exist.`,
          status: HttpStatus.CONFLICT,
        };
      }

      const body = {
        ...createUserDto,
        role: role._id,
      };

      const createdUser: User = await this.userService.createUser(body);
      return {
        message: 'User successfully created.',
        status: HttpStatus.CREATED,
        data: createdUser,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Error adding a user.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllUsers(): Promise<{
    message: string;
    status: number;
    data?: UserSpecificFieldDto[];
  }> {
    try {
      const users = await this.userService.findAllUsers();
      const usersResponse = users.map(
        (value) => new UserSpecificFieldDto(value),
      );
      return {
        message: 'User list successfully retrieved.',
        status: HttpStatus.OK,
        data: usersResponse,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Error during user recovery.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Get(':matricule/detail')
  async findUserById(@Param('matricule') matricule: string): Promise<{
    message: string;
    status: number;
    data?: UserSpecificFieldDto | null;
  }> {
    try {
      const user = await this.userService.findUserByMatricule(matricule);
      if (user) {
        const userDetail = new UserSpecificFieldDto(user);
        return {
          message: 'Detail of a successfully recovered role.',
          status: HttpStatus.OK,
          data: userDetail,
        };
      }
      return {
        message: 'User not found',
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Error during user recovery.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Get('search')
  async searchUser(@Query('search') search: string): Promise<{
    message: string;
    status: number;
    data?: UserSpecificFieldDto[];
  }> {
    try {
      const users = await this.userService.searchUser(search);
      if (users.length > 0) {
        const userSearchResponse = users.map(
          (value) => new UserSpecificFieldDto(value),
        );
        return {
          message: 'User search successfully recovered.',
          status: HttpStatus.OK,
          data: userSearchResponse,
        };
      }
      return {
        message: 'No user found.',
        status: HttpStatus.OK,
        data: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Error searching for a user.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Put(':matricule/update')
  async updateUser(
    @Param('matricule') matricule: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ message: string; status: number; data?: User | null }> {
    try {
      const user = await this.userService.findUserByMatricule(matricule);
      if (user) {
        const role = await this.roleService.findRoleByCode(updateUserDto.role);
        if (!role) {
          return {
            message: `The role [${updateUserDto.role}] does not exist.`,
            status: HttpStatus.CONFLICT,
          };
        }

        const body = {
          ...updateUserDto,
          role: role._id,
        };
        const updatedUser = await this.userService.updateUser(user._id, body);
        return {
          message: 'User successfully updated.',
          status: HttpStatus.OK,
          data: updatedUser,
        };
      }
      return {
        message: 'User not found',
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Error updating a user.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Put(':matricule/account_status')
  async updateUserStatus(
    @Param('matricule') matricule: string,
    @Body() updateUserStatusDto: UpdateStatusUserDto,
  ): Promise<{ message: string; status: number; data?: User | null }> {
    try {
      const user = await this.userService.findUserByMatricule(matricule);
      if (user) {
        const updatedUser = await this.userService.updateStatusUser(
          user._id,
          updateUserStatusDto,
        );
        return {
          message: 'User status successfully updated.',
          status: HttpStatus.OK,
          data: updatedUser,
        };
      }
      return {
        message: 'User not found',
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Error updating a user.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Put(':matricule/picture')
  @UseInterceptors(FileInterceptor('photo', multerConfig(staticUrlImage)))
  async uploadProfileStatus(
    @UploadedFile() file: Request,
    @Param('matricule') matricule: string,
    @Body() pictureUploadDto: PictureUploadDto,
  ): Promise<{ message: string; status: number; data?: User | null }> {
    try {
      const user = await this.userService.findUserByMatricule(matricule);
      if (user) {
        const baseUrl = process.env.BASE_URL;
        const imageUrl = file ? file.path : null;
        const urlHost = `${baseUrl}/${imageUrl}`;
        if (imageUrl) {
          const body = {
            ...pictureUploadDto,
            photo: urlHost,
          };
          const updatedUser = await this.userService.updatePictureUser(
            user._id,
            body,
          );
          return {
            message: 'User photo successfully updated.',
            status: HttpStatus.OK,
            data: updatedUser,
          };
        }
        return {
          message: 'No image',
          status: HttpStatus.BAD_REQUEST,
        };
      }
      return {
        message: 'User not found',
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            "Error uploading a user's image.";

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Delete(':matricule/delete')
  async deleteUser(
    @Param('matricule') matricule: string,
  ): Promise<{ message: string; status: number; data?: User | null }> {
    try {
      const role = await this.userService.findUserByMatricule(matricule);
      if (role) {
        await this.userService.deleteUser(role._id);
        return {
          message: 'User successfully deleted.',
          status: HttpStatus.OK,
        };
      }
      return {
        message: 'User not found',
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Error when deleting user.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
