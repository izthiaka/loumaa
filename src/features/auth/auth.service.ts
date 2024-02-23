import { ConflictException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
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
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/entities/user/user.schema';
import UserStatusAccount from 'src/core/constant/user_status_account';
import { isEmail, isPhoneNumber } from 'class-validator';
import { JwtService } from '@nestjs/jwt';
import { UserSessionService } from '../user/services/user_session/user_session.service';
import { RandomCodeUtil } from 'src/core/utils/random-code/random-code.util';
import { MailService } from 'src/services/mail/mail.service';

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
        return result;
      }
      throw new Error('Identifier not found.');
    } catch (error) {
      throw Error(error);
    }
  }

  async signUp(signUpDto: SignUpDto) {
    const { phone, email, password } = signUpDto;
    if (phone) {
      const existingUserPhone = await this.userService.findUserByPhone(phone);
      if (existingUserPhone) {
        throw new Error(`The phone number [${phone}] already exists.`);
      }
    }

    const existingUserEmail = await this.userService.findUserByEmail(email);
    if (existingUserEmail) {
      throw new Error('This e-mail is already in use.');
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
      throw new ConflictException('User not found. Please login.');
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
      throw new Error(
        'The input [identifier] must be an email or a phone number.',
      );

    return type;
  }

  private validatePassword(inputPassword: string, userPassword: string) {
    const passwordIsValid = this.bcrypt.compare(inputPassword, userPassword);
    if (!passwordIsValid)
      throw new Error('Incorrect login and/or password. Please try again.');
  }

  private calculateExpiresIn(hours: number) {
    const expiresInInSeconds = hours * 3600;
    return expiresInInSeconds;
  }

  private checkAccountStatus(status: string) {
    if (status === UserStatusAccount.getPendingStatusLibelle())
      throw new Error('Your account is awaiting validation. Please wait.');

    if (
      status === UserStatusAccount.getDeActivatedStatusLibelle() ||
      status === UserStatusAccount.getBannedStatusLibelle()
    )
      throw new Error('Inactive account, please contact the administrator.');
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
      if (!passwordIsValid) throw new Error('Old password incorrect.');

      const hashedPassword = this.bcrypt.hash(updatePasswordDto.password);
      await this.userService.updatePassword(user._id, hashedPassword);
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
        const code = this.randomCodeUtil.generateCode(6);
        await this.userService.updateIdentifierToken(user._id, code);

        // Send code to email or phone number
        await this.mailService.sendUserConfirmation(
          user,
          'token',
          'confirmation',
        );
        return true;
      }
      throw new Error('Login not found.');
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
    throw new Error('Login not found.');
  }

  checkOTP(checkOTPDto: CheckOTPDto) {
    try {
      // const code = this.otp.validateOtp(
      //   checkOTPDto.code,
      //   'JY4U4NTTGU3ESTTOHM7S6VSPLJ5V2NTRKQ5GQ2CTIY7GELBYKAYA',
      // );
      console.log('checkOTPDto : ', checkOTPDto);
      return true;
    } catch (error) {
      throw Error(error);
    }
  }

  resetPassword() {
    return 'data return';
  }
}
