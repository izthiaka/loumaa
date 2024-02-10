import { Injectable } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import { UserService } from '../user/services/user.service';
import { RoleService } from '../user/services/role.service';
import MatriculeGenerate from 'src/core/utils/matricule_generate';
import BcryptImplement from 'src/core/config/bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/entities/user.schema';
import { Model } from 'mongoose';
import UserStatusAccount from 'src/core/constant/user_status_account';
import { isEmail, isPhoneNumber } from 'class-validator';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly matricule: MatriculeGenerate,
    private readonly bcrypt: BcryptImplement,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto) {
    const { identifiant } = signInDto;
    const { password } = signInDto;

    this.identifier(identifiant);
    const user =
      await this.userService.findByUsernameOrEmailOrPhone(identifiant);
    if (user) {
      const passwordIsValid = this.bcrypt.compare(password, user.password);
      if (!passwordIsValid)
        throw new Error(
          'Identifiant et ou Mot de passe incorrect. Veuillez réessayer.',
        );

      this.statusAccount(user.status);

      const token = await this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user);

      return {
        token,
        refreshToken,
        expireAt: this.calculateExpiresIn(10),
        refreshExpireAt: this.calculateExpiresIn(48),
      };
    }
    throw new Error('Identifiant introuvable.');
  }

  identifier(identifier: string) {
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
    user.status = UserStatusAccount.getActivatedStatusLibelle();
    user.role = role._id;

    await user.save();
    return true;
  }

  async generateAccessToken(user: User): Promise<string> {
    const payload = { username: user.matricule, sub: user._id };
    return this.jwtService.sign(payload);
  }

  async generateRefreshToken(user: User): Promise<string> {
    const payload = { username: user.matricule, sub: user._id };
    return this.jwtService.sign(payload, { expiresIn: '2d' });
  }

  calculateExpiresIn(hours: number) {
    const expiresInInSeconds = hours * 3600;
    return expiresInInSeconds;
  }

  statusAccount(status: string) {
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

  refreshToken() {
    return 'data return';
  }

  logOut() {
    return 'data return';
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

  updatePassword() {
    return 'data return';
  }

  deleteAccount() {
    return 'data return';
  }

  profil() {
    return 'data return';
  }
}
