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
  Query,
  ConflictException,
} from '@nestjs/common';
import { Role } from '../../entities/role/role.schema';
import { RoleService } from '../../services/role/role.service';
import { MatriculeGenerate } from 'src/core/utils/matricule_generate/matricule_generate.util';
import {
  CreateRoleDto,
  RoleSpecificFieldDto,
  UpdateRoleDto,
} from '../../dtos/role.dto';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('users/roles')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly matricule: MatriculeGenerate,
  ) {}

  @Post('store')
  @HttpCode(HttpStatus.CREATED)
  async createRole(
    @I18n() i18n: I18nContext,
    @Body()
    createRoleDto: CreateRoleDto,
  ): Promise<{ message: string; status: number; data?: Role }> {
    try {
      const existingRole = await this.roleService.findRoleByName(
        createRoleDto.name,
      );
      if (existingRole) {
        return {
          message: i18n.t('response.ALREADY_EXIST', {
            args: { model: 'Role', attribute: `${createRoleDto.name}` },
          }),
          status: HttpStatus.CONFLICT,
        };
      }
      const body = {
        ...createRoleDto,
        code: this.matricule.generate(),
      };

      const createdRole: Role = await this.roleService.createRole(body as Role);
      return {
        message: i18n.t('response.SUCCESS_CREATE', {
          args: { model: 'Role' },
        }),
        status: HttpStatus.CREATED,
        data: createdRole,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('response.ERROR_CREATED', {
              args: { model: 'Role' },
            });

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllRoles(@I18n() i18n: I18nContext): Promise<{
    message: string;
    status: number;
    data?: RoleSpecificFieldDto[];
  }> {
    try {
      const roles = await this.roleService.findAllRoles();
      const rolesResponse = roles.map(
        (value) => new RoleSpecificFieldDto(value),
      );
      return {
        message: i18n.t('response.SUCCESS_LIST', {
          args: { model: 'Role' },
        }),
        status: HttpStatus.OK,
        data: rolesResponse,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('response.ERROR_LISTING', {
              args: { model: 'Role' },
            });

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Get(':code/detail')
  async findRoleById(
    @I18n() i18n: I18nContext,
    @Param('code') code: string,
  ): Promise<{
    message: string;
    status: number;
    data?: RoleSpecificFieldDto | null;
  }> {
    try {
      const role = await this.roleService.findRoleByCode(code);
      if (role) {
        const roleDetail = new RoleSpecificFieldDto(role);
        return {
          message: i18n.t('response.SUCCESS_RETRIEVED', {
            args: { model: 'Role' },
          }),
          status: HttpStatus.OK,
          data: roleDetail,
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
            i18n.t('response.ERROR_RETRIEVED', { args: { model: 'Role' } });

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Get('search')
  async searchRole(
    @I18n() i18n: I18nContext,
    @Query('search') search: string,
  ): Promise<{
    message: string;
    status: number;
    data?: RoleSpecificFieldDto[];
  }> {
    try {
      const roles = await this.roleService.searchRole(search);
      if (roles.length > 0) {
        const roleSearchResponse = roles.map(
          (value) => new RoleSpecificFieldDto(value),
        );
        return {
          message: i18n.t('response.SUCCESS_SEARCH', {
            args: { model: 'Role' },
          }),
          status: HttpStatus.OK,
          data: roleSearchResponse,
        };
      }
      return {
        message: i18n.t('response.NOT_FOUND', { args: { model: 'Role' } }),
        status: HttpStatus.OK,
        data: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('response.ERROR_SEARCH', { args: { model: 'Role' } });

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Put(':code/update')
  async updateRole(
    @I18n() i18n: I18nContext,
    @Param('code') code: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<{ message: string; status: number; data?: Role | null }> {
    try {
      const role = await this.roleService.findRoleByCode(code);
      if (role) {
        const data = await this.roleService.updateRole(role._id, updateRoleDto);
        return {
          message: i18n.t('response.SUCCESS_UPDATED', {
            args: { model: 'Role' },
          }),
          status: HttpStatus.OK,
          data: data,
        };
      }
      return {
        message: i18n.t('response.NOT_FOUND', { args: { model: 'Role' } }),
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

  @Delete(':code/delete')
  async deleteRole(
    @I18n() i18n: I18nContext,
    @Param('code') code: string,
  ): Promise<{ message: string; status: number; data?: Role | null }> {
    try {
      const role = await this.roleService.findRoleByCode(code);
      if (role) {
        await this.roleService.deleteRole(role._id);
        return {
          message: i18n.t('response.SUCCESS_DELETED', {
            args: { model: 'Role' },
          }),
          status: HttpStatus.OK,
        };
      }
      return {
        message: i18n.t('response.NOT_FOUND', { args: { model: 'Role' } }),
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('response.ERROR_DELETED', { args: { model: 'Role' } });

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
