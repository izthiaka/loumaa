import { ConflictException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { SignInDto, SignUpDto, UpdatePasswordDto } from './dto/auth.dto';
import { UserService } from '../user/services/user.service';
import { RoleService } from '../user/services/role.service';
import MatriculeGenerate from 'src/core/utils/matricule_generate';
import BcryptImplement from 'src/core/config/bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/entities/user.schema';
import UserStatusAccount from 'src/core/constant/user_status_account';
import { isEmail, isPhoneNumber } from 'class-validator';
import { JwtService } from '@nestjs/jwt';
import { UserSessionService } from '../user/services/user_session/user_session.service';

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
  ) {}

  async signIn(signInDto: SignInDto) {
    try {
      this.identifier(signInDto.identifiant);
      const user = await this.userService.findByUsernameOrEmailOrPhone(
        signInDto.identifiant,
      );
      if (user) {
        this.validatePassword(signInDto.password, user.password);
        this.checkAccountStatus(user.status);

        const result = await this.generateToken(user);
        return result;
      }
      throw new Error('Identifiant introuvable.');
    } catch (error) {
      throw Error(error);
    }
  }

  async signUp(signUpDto: SignUpDto) {
    const { phone, email, password } = signUpDto;
    if (phone) {
      const existingUserPhone = await this.userService.findUserByPhone(phone);
      if (existingUserPhone) {
        throw new Error(`Le numéro de téléphone [${phone}] existe déjà.`);
      }
    }

    const existingUserEmail = await this.userService.findUserByEmail(email);
    if (existingUserEmail) {
      throw new Error('Cet e-mail est déja utilisé.');
    }

    const passwordHash = this.bcrypt.hash(password);

    const role = await this.roleService.findRoleByName('Propriétaire');

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
      const user = await this.userService.findUserProfil(username);
      if (user) {
        const result = await this.generateToken(user);
        return result;
      }
      throw new ConflictException(
        'Utilisateur introuvable. Veuillez-vous connecter.',
      );
    } catch (error) {
      throw Error(error);
    }
  }

  async profil(auth: any) {
    try {
      const { username } = auth;
      const user = await this.userService.findUserProfil(username);
      return user;
    } catch (error) {
      throw Error(error);
    }
  }

  private identifier(identifier: string) {
    const isIdentifiantEmail: boolean = isEmail(identifier);
    const isIdentifiantPhone: boolean = isPhoneNumber(identifier);

    let type = null;
    isIdentifiantEmail ? (type = 'email') : type;
    isIdentifiantPhone ? (type = 'phone') : type;

    if (!isIdentifiantEmail && !isIdentifiantPhone)
      throw new Error(
        "L'input [identifiant] doit être un email ou un numéro de téléphone.",
      );

    return type;
  }

  private validatePassword(inputPassword: string, userPassword: string) {
    const passwordIsValid = this.bcrypt.compare(inputPassword, userPassword);
    if (!passwordIsValid)
      throw new Error(
        'Identifiant et ou Mot de passe incorrect. Veuillez réessayer.',
      );
  }

  private calculateExpiresIn(hours: number) {
    const expiresInInSeconds = hours * 3600;
    return expiresInInSeconds;
  }

  private checkAccountStatus(status: string) {
    if (status === UserStatusAccount.getPendingStatusLibelle())
      throw new Error(
        'Votre compte est en attente de validation. Veuillez patienter.',
      );

    if (
      status === UserStatusAccount.getDesactivatedStatusLibelle() ||
      status === UserStatusAccount.getBannedStatusLibelle()
    )
      throw new Error(
        "Compte inactif, veuillez-vous rapprocher de l'administrateur.",
      );
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
      const user = await this.userService.findUserProfil(username);
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
      if (!passwordIsValid) throw new Error('Ancien Mot de passe incorrect.');

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

  forgetPassword() {
    return 'data return';
  }

  checkOTP() {
    return 'data return';
  }

  resetPassword() {
    return 'data return';
  }
}
