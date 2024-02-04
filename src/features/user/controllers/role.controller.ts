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
} from '@nestjs/common';
import { Role } from '../schemas/role.schema';
import { RoleService } from '../services/role.service';
import MatriculeGenerate from 'src/core/utils/matricule_generate';
import {
  CreateRoleDto,
  RoleSpecificFieldDto,
  UpdateRoleDto,
} from '../dtos/role.dto';

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
          message: `Le role [${createRoleDto.name}] existe déjà.`,
          status: HttpStatus.CONFLICT,
        };
      }
      const body = {
        ...createRoleDto,
        code: this.matricule.generate(),
      };

      const createdRole: Role = await this.roleService.createRole(body as Role);
      return {
        message: 'Role créé avec succès.',
        status: HttpStatus.CREATED,
        data: createdRole,
      };
    } catch (error) {
      return {
        message: "Erreur lors de la création d'un role.",
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
        message: 'Liste des roles récupérée avec succès.',
        status: HttpStatus.OK,
        data: rolesResponse,
      };
    } catch (error) {
      return {
        message: 'Erreur lors de la recupération des roles.',
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
          message: "Détail d'un role récupéré avec succès.",
          status: HttpStatus.OK,
          data: roleDetail,
        };
      }
      return {
        message: 'Role introuvable',
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      return {
        message: 'Erreur lors de la recupération du role.',
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
          message: 'Recherche role récupéré avec succès.',
          status: HttpStatus.OK,
          data: roleSearchResponse,
        };
      }
      return {
        message: 'Pas de role trouvé.',
        status: HttpStatus.OK,
        data: [],
      };
    } catch (error) {
      return {
        message: 'Erreur lors de la recupération du role.',
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
          message: "Modification d'un role récupéré avec succès.",
          status: HttpStatus.OK,
          data: data,
        };
      }
      return {
        message: 'Role introuvable',
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      return {
        message: 'Erreur lors de la mise à jour du role.',
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
          message: 'Role supprimé avec succès.',
          status: HttpStatus.OK,
        };
      }
      return {
        message: 'Role introuvable',
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      return {
        message: 'Erreur lors de la supression du role.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
