import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  IsIn,
} from 'class-validator';
import UserStatusAccount from 'src/core/constant/user_status_account';
import { User } from '../entities/user/user.schema';
import { RoleSpecificFieldDto } from './role.dto';

export class CreateUserDto {
  @IsString({
    message: 'Input [name] must be a character string.',
  })
  @IsNotEmpty({ message: 'Input [name] is required.' })
  readonly name: string;

  @IsOptional()
  @IsString({ message: 'The [genre] input must be a character string.' })
  readonly gender?: string;

  @IsOptional()
  @IsEmail(
    {},
    { message: 'The e-mail address must be a valid e-mail address.' },
  )
  readonly email?: string;

  @IsNotEmpty({ message: 'Input [phone] is required.' })
  @IsPhoneNumber(undefined, {
    message: 'The [phone] input must be a valid phone number.',
  })
  readonly phone: string;

  @IsOptional()
  @IsString({ message: 'The [status] input must be a character string.' })
  @IsIn(UserStatusAccount.validation, {
    message: `Valid status:. [${UserStatusAccount.validation}]`,
  })
  readonly status?: string;

  @IsString({ message: 'Input [role] must be a character string.' })
  @IsNotEmpty({ message: 'Input [role] is required.' })
  readonly role: string;
}

export class PictureUploadDto {
  @IsOptional()
  @IsString({ message: 'The [photo] input must be an image.' })
  readonly photo: string;
}

export class UpdateStatusUserDto {
  @IsOptional()
  @IsString({ message: 'The [status] input must be a character string.' })
  @IsIn(UserStatusAccount.validation, { message: 'Invalid status.' })
  readonly status?: string;
}

export class UpdateUserDto {
  @IsString({
    message: 'Input [name] must be a character string.',
  })
  @IsNotEmpty({ message: 'Input [name] is required.' })
  readonly name: string;

  @IsOptional()
  @IsString({ message: 'The [genre] input must be a character string.' })
  readonly gender?: string;

  @IsOptional()
  @IsEmail(
    {},
    { message: 'The e-mail address must be a valid e-mail address.' },
  )
  readonly email?: string;

  @IsNotEmpty({ message: 'Input [phone] is required.' })
  @IsPhoneNumber(undefined, {
    message: 'The [phone] input must be a valid phone number.',
  })
  readonly phone: string;

  @IsOptional()
  @IsString({ message: 'The [status] input must be a character string.' })
  @IsIn(UserStatusAccount.validation, {
    message: `Les status valides:. [${UserStatusAccount.validation}]`,
  })
  readonly status?: string;

  @IsString({ message: 'Input [role] must be a character string.' })
  @IsNotEmpty({ message: 'Input [role] is required.' })
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
