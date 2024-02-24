import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  IsIn,
} from 'class-validator';
import { UserStatusAccount } from 'src/core/constant/user_status_account';
import { User } from '../entities/user/user.schema';
import { RoleSpecificFieldDto } from './role.dto';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateUserDto {
  @IsString({ message: 'validation.NOT_STRING' })
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  readonly name: string;

  @IsOptional()
  @IsString({ message: 'validation.NOT_STRING' })
  readonly gender?: string;

  @IsOptional()
  @IsEmail({}, { message: 'validation.INVALID_EMAIL' })
  readonly email?: string;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @IsPhoneNumber(undefined, { message: 'validation.INVALID_PHONE_NUMBER' })
  readonly phone: string;

  @IsOptional()
  @IsString({ message: 'validation.NOT_STRING' })
  @IsIn(UserStatusAccount.validation, {
    message: i18nValidationMessage('validation.IN_VALID', {
      message: `[${UserStatusAccount.validation}]`,
    }),
  })
  readonly status?: string;

  @IsString({ message: 'validation.NOT_STRING' })
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  readonly role: string;
}

export class PictureUploadDto {
  @IsOptional()
  @IsString({ message: 'The [photo] input must be an image.' })
  readonly photo: string;
}

export class UpdateStatusUserDto {
  @IsOptional()
  @IsString({ message: 'validation.NOT_STRING' })
  @IsIn(UserStatusAccount.validation, {
    message: i18nValidationMessage('validation.IN_VALID', {
      message: `[${UserStatusAccount.validation}]`,
    }),
  })
  readonly status?: string;
}

export class UpdateUserDto {
  @IsString({
    message: 'validation.NOT_STRING',
  })
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  readonly name: string;

  @IsOptional()
  @IsString({ message: 'validation.NOT_STRING' })
  readonly gender?: string;

  @IsOptional()
  @IsEmail({}, { message: 'validation.INVALID_EMAIL' })
  readonly email?: string;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @IsPhoneNumber(undefined, { message: 'validation.INVALID_PHONE_NUMBER' })
  readonly phone: string;

  @IsOptional()
  @IsString({ message: 'validation.NOT_STRING' })
  @IsIn(UserStatusAccount.validation, {
    message: i18nValidationMessage('validation.IN_VALID', {
      message: `[${UserStatusAccount.validation}]`,
    }),
  })
  readonly status?: string;

  @IsString({ message: 'validation.NOT_STRING' })
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
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
