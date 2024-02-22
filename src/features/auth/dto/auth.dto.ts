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
  @IsString({
    message: 'Input [name] must be a character string.',
  })
  @IsNotEmpty({ message: 'Input [name] is required.' })
  readonly name: string;

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

  @IsNotEmpty({ message: 'Input [password] is required.' })
  @MinLength(8, {
    message: 'The password must be at least 8 characters long.',
  })
  readonly password: string;

  @IsNotEmpty({ message: 'The [password_confirm] input is required.' })
  readonly password_confirm: string;
}

export class SignInDto {
  @IsNotEmpty({ message: 'Input [identifier] is required.' })
  readonly identifier: string;

  @IsNotEmpty({ message: 'Input [password] is required.' })
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
  @IsNotEmpty({ message: 'The [old_password] input is required.' })
  readonly old_password: string;

  @IsNotEmpty({ message: 'Input [password] is required.' })
  @MinLength(8, {
    message: 'The password must be at least 8 characters long.',
  })
  readonly password: string;

  @IsNotEmpty({ message: 'The [password_confirm] input is required.' })
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
  @IsNotEmpty({ message: 'Input [identifier] is required.' })
  readonly identifier: string;
}

export class CheckOTPDto {
  @IsNotEmpty({ message: 'Input [code] is required.' })
  readonly code: string;
}
