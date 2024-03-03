import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  IsIn,
} from 'class-validator';
import { UserStatusAccount } from 'src/core/constant/user_status_account';
import { Admin } from '../entities/admin/admin.schema';
import { RoleSpecificFieldDto } from './role.dto';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateAdminDto {
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

export class UpdateStatusAdminDto {
  @IsOptional()
  @IsString({ message: 'validation.NOT_STRING' })
  @IsIn(UserStatusAccount.validation, {
    message: i18nValidationMessage('validation.IN_VALID', {
      message: `[${UserStatusAccount.validation}]`,
    }),
  })
  readonly status?: string;
}

export class UpdateAdminDto {
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

export class AdminSpecificFieldDto {
  name: string;
  matricule: string;
  gender: string;
  email: string;
  phone: string;
  status: string;
  photo: string;
  role: object;

  constructor(admin: Admin) {
    this.name = admin.name;
    this.matricule = admin.matricule;
    this.gender = admin.gender;
    this.email = admin.email;
    this.phone = admin.phone;
    this.status = admin.status;
    this.photo = admin.photo ? admin.photo : null;
    this.role = new RoleSpecificFieldDto(admin.role);
  }
}
