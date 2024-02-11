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

export class SignUpDto {
  @IsString({
    message: "L'input [name] doit être une chaîne de caractères.",
  })
  @IsNotEmpty({ message: "L'input [nom] est requis." })
  readonly name: string;

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

  @IsNotEmpty({ message: "L'input [password] est requis." })
  @MinLength(8, {
    message: 'Le mot de passe doit comporté au minimum de 8 caractéres.',
  })
  readonly password: string;

  @IsNotEmpty({ message: "L'input [password_confirm] est requis." })
  readonly password_confirm: string;
}

export class SignInDto {
  @IsNotEmpty({ message: "L'input [identifiant] est requis." })
  readonly identifiant: string;

  @IsNotEmpty({ message: "L'input [password] est requis." })
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

export class ProdilSpecificFieldDto {
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
    const sessions = user.sessions.map((session) => {
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
