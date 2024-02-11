import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import MatriculeGenerate from 'src/core/utils/matricule_generate';
import BcryptImplement from 'src/core/config/bcrypt';
import { RoleService } from '../user/services/role.service';
import { UserService } from '../user/services/user.service';
import { RoleModule } from '../user/modules/role.module';
import { UserModule } from '../user/modules/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { UserSessionModule } from '../user/modules/user_session.module';

@Module({
  imports: [
    UserModule,
    RoleModule,
    PassportModule,
    UserSessionModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '10h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    MatriculeGenerate,
    BcryptImplement,
    RoleService,
    UserService,
    JwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}