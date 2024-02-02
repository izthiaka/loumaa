import { IsString, IsNotEmpty } from 'class-validator';
import { Role } from '../schemas/role.schema';

export class CreateRoleDto {
  @IsString({ message: "L'input [nom] doit être une chaîne de caractères." })
  @IsNotEmpty({ message: "L'input [nom] est requis." })
  readonly name: string;
}

export class UpdateRoleDto {
  @IsString({ message: "L'input [nom] doit être une chaîne de caractères." })
  @IsNotEmpty({ message: "L'input [nom] est requis." })
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
