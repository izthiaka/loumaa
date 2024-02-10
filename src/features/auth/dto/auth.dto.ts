import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

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
