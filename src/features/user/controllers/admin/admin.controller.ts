import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  ConflictException,
  Query,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AdminService } from '../../services/admin/admin.service';
import { RoleService } from '../../services/role/role.service';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Admin } from '../../entities/admin/admin.schema';
import {
  AdminSpecificFieldDto,
  CreateAdminDto,
  PictureUploadDto,
  UpdateAdminDto,
  UpdateStatusAdminDto,
} from '../../dtos/admin.dto';
import { Request } from 'express';
import { multerConfig } from 'src/core/config/multer-config';
import { FileInterceptor } from '@nestjs/platform-express';

const staticUrlImage = 'images';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly roleService: RoleService,
  ) {}

  @Post('store')
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(
    @I18n() i18n: I18nContext,
    @Body() createAdminDto: CreateAdminDto,
  ): Promise<{ message: string; status: number; data?: Admin }> {
    try {
      const role = await this.roleService.findRoleByCode(createAdminDto.role);
      if (!role) {
        return {
          message: i18n.t('response.NOT_EXIST', {
            args: { model: 'Role', attribute: `${createAdminDto.role}` },
          }),
          status: HttpStatus.CONFLICT,
        };
      }

      const body = {
        ...createAdminDto,
        role: role._id,
      };

      const createdAdmin: Admin = await this.adminService.createAdmin(body);
      return {
        message: i18n.t('response.SUCCESS_CREATE', {
          args: { model: 'Admin' },
        }),
        status: HttpStatus.CREATED,
        data: createdAdmin,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('response.ERROR_CREATED', {
              args: { model: 'Admin' },
            });

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllAdmins(@I18n() i18n: I18nContext): Promise<{
    message: string;
    status: number;
    data?: AdminSpecificFieldDto[];
  }> {
    try {
      const admins = await this.adminService.findAllAdmins();
      const adminsResponse = admins.map(
        (value) => new AdminSpecificFieldDto(value),
      );
      return {
        message: i18n.t('response.SUCCESS_LIST', {
          args: { model: 'Admin' },
        }),
        status: HttpStatus.OK,
        data: adminsResponse,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('response.ERROR_LISTING', {
              args: { model: 'Admin' },
            });

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Get(':matricule/detail')
  async findAdminById(
    @I18n() i18n: I18nContext,
    @Param('matricule') matricule: string,
  ): Promise<{
    message: string;
    status: number;
    data?: AdminSpecificFieldDto | null;
  }> {
    try {
      const admin = await this.adminService.findAdminByMatricule(matricule);
      if (admin) {
        const adminDetail = new AdminSpecificFieldDto(admin);
        return {
          message: i18n.t('response.SUCCESS_RETRIEVED', {
            args: { model: 'Admin' },
          }),
          status: HttpStatus.OK,
          data: adminDetail,
        };
      }
      return {
        message: i18n.t('response.NOT_FOUND', { args: { model: 'Admin' } }),
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('response.ERROR_RETRIEVED', { args: { model: 'Admin' } });

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Get('search')
  async searchAdmin(
    @I18n() i18n: I18nContext,
    @Query('search') search: string,
  ): Promise<{
    message: string;
    status: number;
    data?: AdminSpecificFieldDto[];
  }> {
    try {
      const admins = await this.adminService.searchAdmin(search);
      if (admins.length > 0) {
        const adminSearchResponse = admins.map(
          (value) => new AdminSpecificFieldDto(value),
        );
        return {
          message: i18n.t('response.SUCCESS_SEARCH', {
            args: { model: 'Admin' },
          }),
          status: HttpStatus.OK,
          data: adminSearchResponse,
        };
      }
      return {
        message: i18n.t('response.NOT_FOUND', {
          args: { model: 'Admin' },
        }),
        status: HttpStatus.OK,
        data: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('response.ERROR_SEARCH', { args: { model: 'Admin' } });

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Put(':matricule/update')
  async updateAdmin(
    @I18n() i18n: I18nContext,
    @Param('matricule') matricule: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ): Promise<{ message: string; status: number; data?: Admin | null }> {
    try {
      const admin = await this.adminService.findAdminByMatricule(matricule);
      if (admin) {
        const role = await this.roleService.findRoleByCode(updateAdminDto.role);
        if (!role) {
          return {
            message: i18n.t('response.NOT_EXIST', {
              args: { model: 'Role', attribute: `${updateAdminDto.role}` },
            }),
            status: HttpStatus.CONFLICT,
          };
        }

        const body = {
          ...updateAdminDto,
          role: role._id,
        };
        const updatedAdmin = await this.adminService.updateAdmin(
          admin._id,
          body,
        );
        return {
          message: i18n.t('response.SUCCESS_UPDATED', {
            args: { model: 'Admin' },
          }),
          status: HttpStatus.OK,
          data: updatedAdmin,
        };
      }
      return {
        message: i18n.t('response.NOT_FOUND', {
          args: { model: 'Admin' },
        }),
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Error updating a admin.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Put(':matricule/account_status')
  async updateAdminStatus(
    @I18n() i18n: I18nContext,
    @Param('matricule') matricule: string,
    @Body() updateAdminStatusDto: UpdateStatusAdminDto,
  ): Promise<{ message: string; status: number; data?: Admin | null }> {
    try {
      const admin = await this.adminService.findAdminByMatricule(matricule);
      if (admin) {
        const updatedAdmin = await this.adminService.updateStatusAdmin(
          admin._id,
          updateAdminStatusDto,
        );
        return {
          message: i18n.t('response.SUCCESS_UPDATED', {
            args: { model: 'Admin' },
          }),
          status: HttpStatus.OK,
          data: updatedAdmin,
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
  ): Promise<{ message: string; status: number; data?: Admin | null }> {
    try {
      const admin = await this.adminService.findAdminByMatricule(matricule);
      if (admin) {
        const baseUrl = process.env.BASE_URL;
        const imageUrl = file ? file.path : null;
        const urlHost = `${baseUrl}/${imageUrl}`;
        if (imageUrl) {
          const body = {
            ...pictureUploadDto,
            photo: urlHost,
          };
          const updatedAdmin = await this.adminService.updatePictureAdmin(
            admin._id,
            body,
          );
          return {
            message: i18n.t('response.SUCCESS_FILE'),
            status: HttpStatus.OK,
            data: updatedAdmin,
          };
        }
        return {
          message: i18n.t('response.FILE_REQUIRED'),
          status: HttpStatus.BAD_REQUEST,
        };
      }
      return {
        message: i18n.t('response.NOT_FOUND', {
          args: { model: 'Admin' },
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
  async deleteAdmin(
    @I18n() i18n: I18nContext,
    @Param('matricule') matricule: string,
  ): Promise<{ message: string; status: number; data?: Admin | null }> {
    try {
      const admin = await this.adminService.findAdminByMatricule(matricule);
      if (admin) {
        await this.adminService.deleteAdmin(admin._id);
        return {
          message: i18n.t('response.SUCCESS_DELETED', {
            args: { model: 'Admin' },
          }),
          status: HttpStatus.OK,
        };
      }
      return {
        message: i18n.t('response.NOT_FOUND', {
          args: { model: 'Admin' },
        }),
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('response.ERROR_DELETED', { args: { model: 'Admin' } });

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
