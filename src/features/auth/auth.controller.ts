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
  CheckIdentifierDto,
  CheckOTPDto,
  ProfileSpecificFieldDto,
  SignInDto,
  SignUpDto,
  TokenDto,
  UpdatePasswordDto,
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
  async profile(@Req() request: Request & { matricule: string }): Promise<{
    message: string;
    status: number;
    data?: ProfileSpecificFieldDto;
  }> {
    try {
      const req = request.matricule;
      const profil = await this.authService.profil(req);
      const result = new ProfileSpecificFieldDto(profil);
      return {
        message: 'Récupération Profil connecté réussie.',
        status: HttpStatus.CREATED,
        data: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Erreur lors de la récupération du profil.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Post('me/refresh_token')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() request: Request & { matricule: string },
  ): Promise<{ message: string; status: number; data?: TokenDto }> {
    try {
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
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Erreur lors de la mise à jour du token.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Put('me/update_password')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Req() request: Request & { matricule: string },
  ) {
    try {
      const req = request.matricule;
      const profil = await this.authService.profil(req);

      if (profil) {
        const { password, password_confirm } = updatePasswordDto;
        if (password !== password_confirm) {
          return {
            message: 'Les mots de passe ne concordent pas.',
            status: HttpStatus.BAD_REQUEST,
          };
        }

        const result = await this.authService.updatePassword(
          profil,
          updatePasswordDto,
        );
        return {
          message: 'Mise à jour mot de passe réussie.',
          status: HttpStatus.OK,
          data: result,
        };
      }
      return {
        message: 'Profil utilisateur introuvable.',
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Erreur lors de la mise à jour du mot de passe.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Put('me/update_profile')
  @HttpCode(HttpStatus.OK)
  updateProfile() {
    return this.authService.resetPassword();
  }

  @Delete('me/delete_account')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@Req() request: Request & { matricule: string }) {
    try {
      const req = request.matricule;
      const profil = await this.authService.profil(req);
      if (profil) {
        const result = await this.authService.deleteAccount(profil);
        return {
          message: 'Suppression de compte réussie.',
          status: HttpStatus.OK,
          data: result,
        };
      }
      return {
        message: 'Profil utilisateur introuvable.',
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Erreur lors de la suppression de compte.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logOut(
    @Req() request: Request & { matricule: object },
  ): Promise<{ message: string; status: number; data?: boolean }> {
    try {
      const req = request.matricule;
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

  @Post('signin/forget_password')
  @HttpCode(HttpStatus.OK)
  async forgetPassword(@Body() checkIdentifierDto: CheckIdentifierDto) {
    try {
      const result = await this.authService.forgetPassword(checkIdentifierDto);
      return {
        message: 'Envoi code OTP réussie.',
        status: HttpStatus.OK,
        data: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Erreur lors de la vérification.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Post('signin/check_code')
  @HttpCode(HttpStatus.OK)
  checkOTP(@Body() checkOTPDto: CheckOTPDto) {
    try {
      return this.authService.checkOTP(checkOTPDto);
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Erreur lors de la vérification.';

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Post('signin/reset_password')
  @HttpCode(HttpStatus.OK)
  resetPassword() {
    return this.authService.resetPassword();
  }
}
