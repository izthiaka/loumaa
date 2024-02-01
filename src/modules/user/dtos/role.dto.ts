import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @IsString({ message: 'Le nom du rôle doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'Le nom du rôle est requis.' })
  readonly name: string;
}

export class UpdateRoleDto {
  @IsString({ message: 'Le nom du rôle doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'Le nom du rôle est requis.' })
  readonly name?: string;
}

export class RoleSpecificFieldDto {
  name: string;
  code: string;

  constructor(name: string, code: string) {
    this.name = name;
    this.code = code;
  }
}
