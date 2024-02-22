import { IsString, IsNotEmpty } from 'class-validator';
import { Role } from '../entities/role/role.schema';

export class CreateRoleDto {
  @IsString({ message: 'Input [name] must be a character string.' })
  @IsNotEmpty({ message: 'Input [name] is required.' })
  readonly name: string;
}

export class UpdateRoleDto {
  @IsString({ message: 'Input [name] must be a character string.' })
  @IsNotEmpty({ message: 'Input [name] is required.' })
  readonly name?: string;
}

export class RoleSpecificFieldDto {
  name: string;
  code: string;

  constructor(role: Role) {
    this.name = role.name;
    this.code = role.code;
  }
}
