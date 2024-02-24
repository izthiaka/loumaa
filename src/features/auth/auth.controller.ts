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
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin/identifier')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @I18n() i18n: I18nContext,
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
        message: i18n.t('auth.SUCCESS_LOGIN'),
        status: HttpStatus.OK,
        data: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('auth.ERROR_CONNECTION');

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Post('signup/create_account')
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @I18n() i18n: I18nContext,
    @Body() signUpDto: SignUpDto,
  ): Promise<{ message: string; status: number; data?: boolean }> {
    try {
      const { password, password_confirm } = signUpDto;
      if (password !== password_confirm) {
        return {
          message: i18n.t('auth.PASSWORD_NOT_MATCH'),
          status: HttpStatus.BAD_REQUEST,
        };
      }

      const result = await this.authService.signUp(signUpDto);
      return {
        message: i18n.t('auth.SUCCESS_REGISTER'),
        status: HttpStatus.CREATED,
        data: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('auth.ERROR_REGISTER');

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async profile(
    @I18n() i18n: I18nContext,
    @Req() request: Request & { matricule: string },
  ): Promise<{
    message: string;
    status: number;
    data?: ProfileSpecificFieldDto;
  }> {
    try {
      const req = request.matricule;
      const profile = await this.authService.profile(req);
      const result = new ProfileSpecificFieldDto(profile);
      return {
        message: i18n.t('auth.PROFILE_CONNECTED'),
        status: HttpStatus.CREATED,
        data: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('auth.PROFILE_FAILED');

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
    @I18n() i18n: I18nContext,
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
        message: i18n.t('auth.REFRESH_TOKEN'),
        status: HttpStatus.OK,
        data: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('auth.ERROR_UPDATE_TOKEN');

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
    @I18n() i18n: I18nContext,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Req() request: Request & { matricule: string },
  ) {
    try {
      const req = request.matricule;
      const profile = await this.authService.profile(req);

      if (profile) {
        const { password, password_confirm } = updatePasswordDto;
        if (password !== password_confirm) {
          return {
            message: i18n.t('auth.PASSWORD_NOT_MATCH'),
            status: HttpStatus.BAD_REQUEST,
          };
        }

        const result = await this.authService.updatePassword(
          profile,
          updatePasswordDto,
        );
        return {
          message: i18n.t('auth.SUCCESS_UPDATE_PASSWORD'),
          status: HttpStatus.OK,
          data: result,
        };
      }
      return {
        message: i18n.t('auth.PROFILE_NOT_FOUND'),
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('auth.ERROR_UPDATE_PASSWORD');

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
  async deleteAccount(
    @I18n() i18n: I18nContext,
    @Req() request: Request & { matricule: string },
  ) {
    try {
      const req = request.matricule;
      const profile = await this.authService.profile(req);
      if (profile) {
        const result = await this.authService.deleteAccount(profile);
        return {
          message: i18n.t('auth.DELETED_ACCOUNT'),
          status: HttpStatus.OK,
          data: result,
        };
      }
      return {
        message: i18n.t('auth.PROFILE_NOT_FOUND'),
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('auth.ERROR_DELETED_ACCOUNT');

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
    @I18n() i18n: I18nContext,
    @Req() request: Request & { matricule: object },
  ): Promise<{ message: string; status: number; data?: boolean }> {
    try {
      const req = request.matricule;
      const result = await this.authService.logOut(req);
      return {
        message: i18n.t('auth.SUCCESS_LOGOUT'),
        status: HttpStatus.OK,
        data: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('auth.ERROR_LOGOUT');

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Post('signin/forget_password')
  @HttpCode(HttpStatus.OK)
  async forgetPassword(
    @I18n() i18n: I18nContext,
    @Body() checkIdentifierDto: CheckIdentifierDto,
  ) {
    try {
      const result = await this.authService.forgetPassword(checkIdentifierDto);
      return {
        message: i18n.t('auth.SUCCESS_OTP'),
        status: HttpStatus.OK,
        data: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('auth.ERROR_SENDING_OTP');

      return {
        message: errorMessage,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Post('signin/check_code')
  @HttpCode(HttpStatus.OK)
  checkOTP(@I18n() i18n: I18nContext, @Body() checkOTPDto: CheckOTPDto) {
    try {
      return this.authService.checkOTP(checkOTPDto);
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            i18n.t('auth.ERROR_CHECKING');

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
