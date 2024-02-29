import { ConflictException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { I18nService } from 'nestjs-i18n';
import { isEmail, isPhoneNumber } from 'class-validator';
import { JwtService } from '@nestjs/jwt';
// import * as speakeasy from 'speakeasy';
import {
  CheckIdentifierDto,
  CheckOTPDto,
  SignInDto,
  SignUpDto,
  UpdatePasswordDto,
} from './dto/auth.dto';
import { UserService } from '../user/services/user/user.service';
import { RoleService } from '../user/services/role/role.service';
import { MatriculeGenerate } from 'src/core/utils/matricule_generate/matricule_generate.util';
import BcryptImplement from 'src/core/config/bcrypt-config';
import { User } from '../user/entities/user/user.schema';
import { UserStatusAccount } from 'src/core/constant/user_status_account';
import { UserSessionService } from '../user/services/user_session/user_session.service';
import { RandomCodeUtil } from 'src/core/utils/random-code/random-code.util';
import { MailService } from 'src/services/mail/mail.service';
import { LoggerService } from 'src/logger/logger.service';
import { OTP } from 'src/core/utils/two-factor-auth/otp.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly userSessionService: UserSessionService,
    private readonly matricule: MatriculeGenerate,
    private readonly bcrypt: BcryptImplement,
    private readonly jwtService: JwtService,
    private readonly randomCodeUtil: RandomCodeUtil,
    private mailService: MailService,
    private readonly i18n: I18nService,
    private readonly logger: LoggerService,
    private speakeasy: OTP,
  ) {}

  async signIn(signInDto: SignInDto) {
    try {
      this.identifier(signInDto.identifier);
      const user = await this.userService.findByUsernameOrEmailOrPhone(
        signInDto.identifier,
      );
      if (user) {
        this.validatePassword(signInDto.password, user.password);
        this.checkAccountStatus(user.status);

        const result = await this.generateToken(user);
        this.logger.log(
          `User with matricule ${user.matricule} has successfully logged in`,
          'Login',
        );
        return result;
      }
      throw new Error(
        this.i18n.t('response.NOT_FOUND', { args: { model: 'User' } }),
      );
    } catch (error) {
      throw Error(error);
    }
  }

  async signUp(signUpDto: SignUpDto) {
    const { phone, email, password } = signUpDto;
    if (phone) {
      const existingUserPhone = await this.userService.findUserByPhone(phone);
      if (existingUserPhone) {
        throw new ConflictException(
          this.i18n.t('response.ALREADY_EXIST', {
            args: { model: 'User', attribute: `${phone}` },
          }),
        );
      }
    }

    const existingUserEmail = await this.userService.findUserByEmail(email);
    if (existingUserEmail) {
      throw new ConflictException(
        this.i18n.t('response.ALREADY_EXIST', {
          args: { model: 'User', attribute: `${email}` },
        }),
      );
    }

    const passwordHash = this.bcrypt.hash(password);

    const role = await this.roleService.findRoleByName('Owner');

    const user = new this.userModel(signUpDto);
    user.matricule = this.matricule.generate();
    user.password = passwordHash;
    user.role = role._id;

    await user.save();

    // Send email to user with confirm account link
    /*const token = this.jwtService.sign({ id: user.id });
     const url = `${process.env.FRONT_END_URL}/auth/confirm/${token}`;*/

    //await this.sendConfirmAccountMail(user.email, user.matricule, url);
    this.logger.log(
      `User with matricule ${user.matricule} has successfully registered`,
      'Register',
    );
    return true;
  }

  async refreshToken(auth: any) {
    try {
      const { username } = auth;
      const user = await this.userService.findUserProfile(username);
      if (user) {
        const result = await this.generateToken(user);
        return result;
      }
      throw new ConflictException(this.i18n.t('auth.REFRESH_TOKEN_EXPIRE'));
    } catch (error) {
      throw Error(error);
    }
  }

  async profile(auth: any) {
    try {
      const { username } = auth;
      const user = await this.userService.findUserProfile(username);
      return user;
    } catch (error) {
      throw Error(error);
    }
  }

  private identifier(identifier: string) {
    const isIdentifierEmail: boolean = isEmail(identifier);
    const isIdentifierPhone: boolean = isPhoneNumber(identifier);

    let type = null;
    isIdentifierEmail ? (type = 'email') : type;
    isIdentifierPhone ? (type = 'phone') : type;

    if (!isIdentifierEmail && !isIdentifierPhone)
      throw new Error(this.i18n.t('auth.IDENTIFIER_INVALID'));

    return type;
  }

  private validatePassword(inputPassword: string, userPassword: string) {
    const passwordIsValid = this.bcrypt.compare(inputPassword, userPassword);
    if (!passwordIsValid)
      throw new Error(this.i18n.t('auth.LOGIN_OR_PASSWORD_INVALID'));
  }

  private calculateExpiresIn(hours: number) {
    const expiresInInSeconds = hours * 3600;
    return expiresInInSeconds;
  }

  private checkAccountStatus(status: string) {
    if (status === UserStatusAccount.getPendingStatusLibelle())
      throw new Error(this.i18n.t('auth.ACCOUNT_AWAITING'));

    if (
      status === UserStatusAccount.getDeActivatedStatusLibelle() ||
      status === UserStatusAccount.getBannedStatusLibelle()
    )
      throw new Error(this.i18n.t('auth.ACCOUNT_INACTIVE'));
  }

  async generateAccessToken(user: User): Promise<string> {
    const payload = { username: user.matricule, sub: user._id };
    return this.jwtService.sign(payload);
  }

  async generateRefreshToken(user: User): Promise<string> {
    const payload = { username: user.matricule, sub: user._id };
    return this.jwtService.sign(payload, { expiresIn: '2d' });
  }

  private async generateToken(user: User): Promise<any> {
    const token = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    await this.userSessionService.updateSession(user._id, {
      $set: {
        user: user._id,
        token,
        refresh_token: refreshToken,
        device: 'null',
      },
    });

    return {
      token,
      refreshToken,
      expireAt: this.calculateExpiresIn(10),
      refreshExpireAt: this.calculateExpiresIn(48),
    };
  }

  async logOut(auth: any) {
    try {
      const { username } = auth;
      const user = await this.userService.findUserProfile(username);
      await this.userSessionService.deleteSession(user._id);

      this.logger.log(`User ${username} has logged out`, `Logout`);
      return true;
    } catch (error) {
      throw Error(error);
    }
  }

  async updatePassword(user: any, updatePasswordDto: UpdatePasswordDto) {
    try {
      const passwordIsValid = this.bcrypt.compare(
        updatePasswordDto.old_password,
        user.password,
      );
      if (!passwordIsValid) throw new Error(this.i18n.t('auth.OLD_PASSWORD'));

      const hashedPassword = this.bcrypt.hash(updatePasswordDto.password);
      await this.userService.updatePassword(user._id, hashedPassword);
      this.logger.log(`${user.matricule} has updated his password`, 'Update');
      return true;
    } catch (error) {
      throw Error(error);
    }
  }

  async deleteAccount(auth: any) {
    try {
      const { _id } = auth;

      await this.userService.deleteUser(_id);
      await this.userSessionService.deleteSession(_id);

      this.logger.log(`User ${_id} has deleted his account`, 'Delete Account');
      return true;
    } catch (error) {
      throw Error(error);
    }
  }

  async forgetPassword(
    checkIdentifierDto: CheckIdentifierDto,
  ): Promise<boolean> {
    try {
      this.identifier(checkIdentifierDto.identifier);
      const user = await this.userService.findByUsernameOrEmailOrPhone(
        checkIdentifierDto.identifier,
      );
      if (user) {
        const { code, secret } = this.speakeasy.generateOtp();
        console.log('code : ', `${code}`);
        console.log('secret : ', `${secret}`);
        await this.userService.updateIdentifierToken(user._id, secret);

        this.mailService.sendUserConfirmation(user, code, 'confirmation');
        return true;
      }
      throw new Error(
        this.i18n.t('response.NOT_FOUND', { args: { model: 'User' } }),
      );
    } catch (error) {
      throw Error(error);
    }
  }

  async sendResetPasswordLink(checkIdentifierDto: CheckIdentifierDto) {
    this.identifier(checkIdentifierDto.identifier);
    const user = await this.userService.findByUsernameOrEmailOrPhone(
      checkIdentifierDto.identifier,
    );
    if (user) {
      // Send email to user with reset password link
      /*const token = this.jwtService.sign({ id: user.id });
      const url = `${process.env.FRONT_END_URL}/auth/reset_password/${token}`;

      await this.sendResetPasswordMail(user.email, user.matricule, url);*/
      await this.mailService.sendUserConfirmation(
        user,
        'token',
        'confirmation',
      );
      return true;
    }
    throw new Error(
      this.i18n.t('response.NOT_FOUND', { args: { model: 'User' } }),
    );
  }

  async checkOTP(checkOTPDto: CheckOTPDto) {
    try {
      console.log('checkOTPDto code : ', checkOTPDto.code);
      const result = this.speakeasy.validateOtp(checkOTPDto.code);
      // const code = this.otp.validateOtp(
      //   checkOTPDto.code,
      //   'JY4U4NTTGU3ESTTOHM7S6VSPLJ5V2NTRKQ5GQ2CTIY7GELBYKAYA',
      // );
      console.log('speakeasy result : ', result);
      return result;
    } catch (error) {
      throw Error(error);
    }
  }

  resetPassword() {
    return 'data return';
  }
}
