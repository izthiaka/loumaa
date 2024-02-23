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
        message: 'Authentication successful.',
        status: HttpStatus.OK,
        data: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Connection error.';

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
          message: 'The passwords do not match.',
          status: HttpStatus.BAD_REQUEST,
        };
      }

      const result = await this.authService.signUp(signUpDto);
      return {
        message: 'Successful registration.',
        status: HttpStatus.CREATED,
        data: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Registration error.';

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
      const profile = await this.authService.profile(req);
      const result = new ProfileSpecificFieldDto(profile);
      return {
        message: 'Profile recovery successful.',
        status: HttpStatus.CREATED,
        data: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Error when retrieving profile.';

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
        message: 'Token successfully refreshed.',
        status: HttpStatus.OK,
        data: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Error updating token.';

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
      const profile = await this.authService.profile(req);

      if (profile) {
        const { password, password_confirm } = updatePasswordDto;
        if (password !== password_confirm) {
          return {
            message: 'The passwords do not match.',
            status: HttpStatus.BAD_REQUEST,
          };
        }

        const result = await this.authService.updatePassword(
          profile,
          updatePasswordDto,
        );
        return {
          message: 'Password update successful.',
          status: HttpStatus.OK,
          data: result,
        };
      }
      return {
        message: 'User profile not found.',
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Error updating password.';

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
      const profile = await this.authService.profile(req);
      if (profile) {
        const result = await this.authService.deleteAccount(profile);
        return {
          message: 'Successful account deletion.',
          status: HttpStatus.OK,
          data: result,
        };
      }
      return {
        message: 'User profile not found.',
        status: HttpStatus.NOT_FOUND,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Account deletion error.';

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
        message: 'Successful logout.',
        status: HttpStatus.OK,
        data: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Error during disconnection.';

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
        message: 'OTP code sent successfully.',
        status: HttpStatus.OK,
        data: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConflictException
          ? (error.getResponse() as { message: string }).message
          : error.message.replace(/^ConflictException: /, '') ||
            'Error during verification.';

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
