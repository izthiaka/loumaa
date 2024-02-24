import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { RoleSpecificFieldDto } from 'src/features/user/dtos/role.dto';
import { UserSessionSpecificFieldDto } from 'src/features/user/dtos/user_session.dto';
import { UserSession } from 'src/features/user/entities/user_session/user_session.schema';

export class SignUpDto {
  @IsString({ message: 'validation.NOT_STRING' })
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  readonly name: string;

  @IsOptional()
  @IsEmail({}, { message: 'validation.INVALID_EMAIL' })
  readonly email?: string;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @IsPhoneNumber(undefined, { message: 'validation.INVALID_PHONE_NUMBER' })
  readonly phone: string;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @MinLength(8, { message: 'validation.MIN' })
  readonly password: string;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  readonly password_confirm: string;
}

export class SignInDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  readonly identifier: string;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  readonly password: string;
}

export class TokenDto {
  type: string;
  access_token: string;
  refresh_token: string;
  expire_at: number;
  refresh_expire_at: number;

  constructor(
    token: string,
    refresh_token: string,
    expire_at: number,
    refresh_expire_at: number,
  ) {
    this.type = 'Bearer';
    this.access_token = token;
    this.expire_at = expire_at;
    this.refresh_token = refresh_token;
    this.refresh_expire_at = refresh_expire_at;
  }
}

export class UpdatePasswordDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  readonly old_password: string;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @MinLength(8, { message: 'validation.MIN' })
  readonly password: string;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  readonly password_confirm: string;
}

export class ProfileSpecificFieldDto {
  name: string;
  matricule: string;
  gender: string;
  email: string;
  phone: string;
  status: string;
  photo: string;
  role: object;
  sessions: any;
  authorizations: any;

  constructor(user: any) {
    const sessions = user.sessions.map((session: UserSession) => {
      return new UserSessionSpecificFieldDto(session);
    });
    this.name = user.name;
    this.matricule = user.matricule;
    this.gender = user.gender;
    this.email = user.email;
    this.phone = user.phone;
    this.status = user.status;
    this.photo = user.photo ? user.photo : null;
    this.role = new RoleSpecificFieldDto(user.role);
    this.sessions = sessions;
    this.authorizations = [];
  }
}

export class CheckIdentifierDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  readonly identifier: string;
}

export class CheckOTPDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  readonly code: string;
}
