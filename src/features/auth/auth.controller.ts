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
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ProdilSpecificFieldDto,
  SignInDto,
  SignUpDto,
  TokenDto,
} from './dto/auth.dto';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { Request } from 'express';

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

  @Get('me')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async profil(@Req() request: Request & { matricule: string }) {
    const req = request.matricule;
    const profil = await this.authService.profil(req);
    const result = new ProdilSpecificFieldDto(profil);
    return result;
  }

  @Post('me/refresh_token')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() request: Request & { matricule: string },
  ): Promise<{ message: string; status: number; data?: TokenDto }> {
    const req = request.matricule;
    const tokenRefresh = await this.authService.refreshToken(req);

    const result = new TokenDto(
      tokenRefresh.token,
      tokenRefresh.refreshToken,
      tokenRefresh.expireAt,
      tokenRefresh.refreshExpireAt,
    );
    return {
      message: 'Token rafraichi avec succès.',
      status: HttpStatus.OK,
      data: result,
    };
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

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logOut(
    @Req() request: Request & { matricule: object },
  ): Promise<{ message: string; status: number; data?: boolean }> {
    try {
      const req = request.matricule;
      await this.checkToken(req);
      const result = await this.authService.logOut(req);
      return {
        message: 'Déconnexion réussie.',
        status: HttpStatus.OK,
        data: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Erreur lors de la déconnexion.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async checkToken(payload: object) {
    console.log('check token' + payload);
    return 'data return';
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
}
