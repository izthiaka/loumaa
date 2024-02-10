import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto, TokenDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin/identifier')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() signInDto: SignInDto,
  ): Promise<{ message: string; status: number; data?: TokenDto }> {
    try {
      const auth = await this.authService.signIn(signInDto);
      const result = new TokenDto(
        auth.token,
        auth.refreshToken,
        auth.expireAt,
        auth.refreshExpireAt,
      );

      return {
        message: 'Authentification réussie.',
        status: HttpStatus.OK,
        data: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Erreur lors de la connexion.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Post('signup/create_account')
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body() signUpDto: SignUpDto,
  ): Promise<{ message: string; status: number; data?: boolean }> {
    try {
      const { password, password_confirm } = signUpDto;
      if (password !== password_confirm) {
        return {
          message: 'Les mots de passe ne concordent pas.',
          status: HttpStatus.BAD_REQUEST,
        };
      }

      const result = await this.authService.signUp(signUpDto);
      return {
        message: 'Inscription réussie.',
        status: HttpStatus.CREATED,
        data: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            "Erreur lors de l'inscription.";

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Post('refresh_token')
  @HttpCode(HttpStatus.OK)
  refreshToken() {
    return this.authService.refreshToken();
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logOut() {
    return this.authService.logOut();
  }

  @Post('signin/forget_password')
  @HttpCode(HttpStatus.OK)
  forgetPassword() {
    return this.authService.forgetPassword();
  }

  @Post('signin/check_code')
  @HttpCode(HttpStatus.OK)
  checkOTP() {
    return this.authService.checkOTP();
  }

  @Post('signin/reset_password')
  @HttpCode(HttpStatus.OK)
  resetPassword() {
    return this.authService.resetPassword();
  }

  @Put('me/update_password')
  @HttpCode(HttpStatus.OK)
  updatePassword() {
    return this.authService.updatePassword();
  }

  @Delete('me/delete_account')
  @HttpCode(HttpStatus.OK)
  deleteAccount() {
    return this.authService.deleteAccount();
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  profil() {
    return this.authService.profil();
  }
}
