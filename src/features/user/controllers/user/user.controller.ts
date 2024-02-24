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
import { I18n, I18nContext } from 'nestjs-i18n';

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
    @I18n() i18n: I18nContext,
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ message: string; status: number; data?: User }> {
    try {
      const role = await this.roleService.findRoleByCode(createUserDto.role);
      if (!role) {
        return {
          message: i18n.t('response.NOT_EXIST', {
            args: { model: 'Role', attribute: `${createUserDto.role}` },
          }),
          status: HttpStatus.CONFLICT,
        };
      }

      const body = {
        ...createUserDto,
        role: role._id,
      };

      const createdUser: User = await this.userService.createUser(body);
      return {
        message: i18n.t('response.SUCCESS_CREATE', {
          args: { model: 'User' },
        }),
        status: HttpStatus.CREATED,
        data: createdUser,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('response.ERROR_CREATED', {
              args: { model: 'User' },
            });

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllUsers(@I18n() i18n: I18nContext): Promise<{
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
        message: i18n.t('response.SUCCESS_LIST', {
          args: { model: 'User' },
        }),
        status: HttpStatus.OK,
        data: usersResponse,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('response.ERROR_LISTING', {
              args: { model: 'User' },
            });

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Get(':matricule/detail')
  async findUserById(
    @I18n() i18n: I18nContext,
    @Param('matricule') matricule: string,
  ): Promise<{
    message: string;
    status: number;
    data?: UserSpecificFieldDto | null;
  }> {
    try {
      const user = await this.userService.findUserByMatricule(matricule);
      if (user) {
        const userDetail = new UserSpecificFieldDto(user);
        return {
          message: i18n.t('response.SUCCESS_RETRIEVED', {
            args: { model: 'User' },
          }),
          status: HttpStatus.OK,
          data: userDetail,
        };
      }
      return {
        message: i18n.t('response.NOT_FOUND', { args: { model: 'User' } }),
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('response.ERROR_RETRIEVED', { args: { model: 'User' } });

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Get('search')
  async searchUser(
    @I18n() i18n: I18nContext,
    @Query('search') search: string,
  ): Promise<{
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
          message: i18n.t('response.SUCCESS_SEARCH', {
            args: { model: 'User' },
          }),
          status: HttpStatus.OK,
          data: userSearchResponse,
        };
      }
      return {
        message: i18n.t('response.NOT_FOUND', {
          args: { model: 'User' },
        }),
        status: HttpStatus.OK,
        data: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('response.ERROR_SEARCH', { args: { model: 'User' } });

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Put(':matricule/update')
  async updateUser(
    @I18n() i18n: I18nContext,
    @Param('matricule') matricule: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ message: string; status: number; data?: User | null }> {
    try {
      const user = await this.userService.findUserByMatricule(matricule);
      if (user) {
        const role = await this.roleService.findRoleByCode(updateUserDto.role);
        if (!role) {
          return {
            message: i18n.t('response.NOT_EXIST', {
              args: { model: 'Role', attribute: `${updateUserDto.role}` },
            }),
            status: HttpStatus.CONFLICT,
          };
        }

        const body = {
          ...updateUserDto,
          role: role._id,
        };
        const updatedUser = await this.userService.updateUser(user._id, body);
        return {
          message: i18n.t('response.SUCCESS_UPDATED', {
            args: { model: 'User' },
          }),
          status: HttpStatus.OK,
          data: updatedUser,
        };
      }
      return {
        message: i18n.t('response.NOT_FOUND', {
          args: { model: 'User' },
        }),
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
    @I18n() i18n: I18nContext,
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
          message: i18n.t('response.SUCCESS_UPDATED', {
            args: { model: 'User' },
          }),
          status: HttpStatus.OK,
          data: updatedUser,
        };
      }
      return {
        message: i18n.t('response.NOT_FOUND', {
          args: { model: 'Role' },
        }),
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('response.ERROR_UPDATED', { args: { model: 'Role' } });

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Put(':matricule/picture')
  @UseInterceptors(FileInterceptor('photo', multerConfig(staticUrlImage)))
  async uploadProfileStatus(
    @I18n() i18n: I18nContext,
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
            message: i18n.t('response.SUCCESS_FILE'),
            status: HttpStatus.OK,
            data: updatedUser,
          };
        }
        return {
          message: i18n.t('response.FILE_REQUIRED'),
          status: HttpStatus.BAD_REQUEST,
        };
      }
      return {
        message: i18n.t('response.NOT_FOUND', {
          args: { model: 'User' },
        }),
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('response.ERROR_FILE');

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Delete(':matricule/delete')
  async deleteUser(
    @I18n() i18n: I18nContext,
    @Param('matricule') matricule: string,
  ): Promise<{ message: string; status: number; data?: User | null }> {
    try {
      const user = await this.userService.findUserByMatricule(matricule);
      if (user) {
        await this.userService.deleteUser(user._id);
        return {
          message: i18n.t('response.SUCCESS_DELETED', {
            args: { model: 'User' },
          }),
          status: HttpStatus.OK,
        };
      }
      return {
        message: i18n.t('response.NOT_FOUND', {
          args: { model: 'User' },
        }),
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('response.ERROR_DELETED', { args: { model: 'User' } });

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
