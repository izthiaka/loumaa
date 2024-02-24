import { IsString, IsNotEmpty } from 'class-validator';
import { Role } from '../entities/role/role.schema';

export class CreateRoleDto {
  @IsString({ message: 'validation.NOT_STRING' })
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  readonly name: string;
}

export class UpdateRoleDto {
  @IsString({ message: 'validation.NOT_STRING' })
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
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
