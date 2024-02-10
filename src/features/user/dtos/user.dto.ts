import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  IsIn,
} from 'class-validator';
import UserStatusAccount from 'src/core/constant/user_status_account';
import { User } from '../entities/user.schema';
import { RoleSpecificFieldDto } from './role.dto';

export class CreateUserDto {
  @IsString({
    message: "L'input [nom] doit être une chaîne de caractères.",
  })
  @IsNotEmpty({ message: "L'input [nom] est requis." })
  readonly name: string;

  @IsOptional()
  @IsString({ message: "L'input [genre] doit être une chaîne de caractères." })
  readonly gender?: string;

  @IsOptional()
  @IsEmail(
    {},
    { message: "L'adresse e-mail doit être une adresse e-mail valide." },
  )
  readonly email?: string;

  @IsNotEmpty({ message: "L'input [phone] est requis." })
  @IsPhoneNumber(undefined, {
    message: "L'input [phone] doit être un numéro de téléphone valide.",
  })
  readonly phone: string;

  @IsOptional()
  @IsString({ message: "L'input [statut] doit être une chaîne de caractères." })
  @IsIn(UserStatusAccount.validation, {
    message: `Les status valides:. [${UserStatusAccount.validation}]`,
  })
  readonly status?: string;

  @IsString({ message: "L'input [role] doit être une chaîne de caractères." })
  @IsNotEmpty({ message: "L'input [role] est requis." })
  readonly role: string;
}

export class PictureUploadDto {
  @IsOptional()
  @IsString({ message: "L'input [photo] doit être une image." })
  readonly photo: string;
}

export class UpdateStatusUserDto {
  @IsOptional()
  @IsString({ message: "L'input [statut] doit être une chaîne de caractères." })
  @IsIn(UserStatusAccount.validation, { message: 'Statut invalide.' })
  readonly status?: string;
}

export class UpdateUserDto {
  @IsString({
    message: "L'input [nom] doit être une chaîne de caractères.",
  })
  @IsNotEmpty({ message: "L'input [nom] est requis." })
  readonly name: string;

  @IsOptional()
  @IsString({ message: "L'input [genre] doit être une chaîne de caractères." })
  readonly gender?: string;

  @IsOptional()
  @IsEmail(
    {},
    { message: "L'adresse e-mail doit être une adresse e-mail valide." },
  )
  readonly email?: string;

  @IsNotEmpty({ message: "L'input [phone] est requis." })
  @IsPhoneNumber(undefined, {
    message: "L'input [phone] doit être un numéro de téléphone valide.",
  })
  readonly phone: string;

  @IsOptional()
  @IsString({ message: "L'input [statut] doit être une chaîne de caractères." })
  @IsIn(UserStatusAccount.validation, {
    message: `Les status valides:. [${UserStatusAccount.validation}]`,
  })
  readonly status?: string;

  @IsString({ message: "L'input [role] doit être une chaîne de caractères." })
  @IsNotEmpty({ message: "L'input [role] est requis." })
  readonly role: string;
}

export class UserSpecificFieldDto {
  name: string;
  matricule: string;
  gender: string;
  email: string;
  phone: string;
  status: string;
  photo: string;
  role: object;

  constructor(user: User) {
    this.name = user.name;
    this.matricule = user.matricule;
    this.gender = user.gender;
    this.email = user.email;
    this.phone = user.phone;
    this.status = user.status;
    this.photo = user.photo ? user.photo : null;
    this.role = new RoleSpecificFieldDto(user.role);
  }
}
