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

@Controller('users/roles')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly matricule: MatriculeGenerate,
  ) {}

  @Post('store')
  @HttpCode(HttpStatus.CREATED)
  async createRole(
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<{ message: string; status: number; data?: Role }> {
    try {
      const existingRole = await this.roleService.findRoleByName(
        createRoleDto.name,
      );
      if (existingRole) {
        return {
          message: `The [${createRoleDto.name}] role already exists.`,
          status: HttpStatus.CONFLICT,
        };
      }
      const body = {
        ...createRoleDto,
        code: this.matricule.generate(),
      };

      const createdRole: Role = await this.roleService.createRole(body as Role);
      return {
        message: 'Role successfully created.',
        status: HttpStatus.CREATED,
        data: createdRole,
      };
    } catch (error) {
      return {
        message: 'Error when creating a role.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllRoles(): Promise<{
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
        message: 'Role list successfully retrieved.',
        status: HttpStatus.OK,
        data: rolesResponse,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Error when retrieving roles.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Get(':code/detail')
  async findRoleById(@Param('code') code: string): Promise<{
    message: string;
    status: number;
    data?: RoleSpecificFieldDto | null;
  }> {
    try {
      const role = await this.roleService.findRoleByCode(code);
      if (role) {
        const roleDetail = new RoleSpecificFieldDto(role);
        return {
          message: 'Detail of a successfully recovered role.',
          status: HttpStatus.OK,
          data: roleDetail,
        };
      }
      return {
        message: 'Role not found',
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Error when retrieving a role.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Get('search')
  async searchRole(@Query('search') search: string): Promise<{
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
          message: 'Search role successfully recovered.',
          status: HttpStatus.OK,
          data: roleSearchResponse,
        };
      }
      return {
        message: 'No role found.',
        status: HttpStatus.OK,
        data: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Error when searching for a role.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Put(':code/update')
  async updateRole(
    @Param('code') code: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<{ message: string; status: number; data?: Role | null }> {
    try {
      const role = await this.roleService.findRoleByCode(code);
      if (role) {
        const data = await this.roleService.updateRole(role._id, updateRoleDto);
        return {
          message: 'Modification of a successfully recovered role.',
          status: HttpStatus.OK,
          data: data,
        };
      }
      return {
        message: 'Role not found',
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Error when updating a role.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Delete(':code/delete')
  async deleteRole(
    @Param('code') code: string,
  ): Promise<{ message: string; status: number; data?: Role | null }> {
    try {
      const role = await this.roleService.findRoleByCode(code);
      if (role) {
        await this.roleService.deleteRole(role._id);
        return {
          message: 'Role successfully deleted.',
          status: HttpStatus.OK,
        };
      }
      return {
        message: 'Role not found',
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Error when deleting a role.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
