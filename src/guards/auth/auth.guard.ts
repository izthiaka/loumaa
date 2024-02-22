import * as moment from 'moment';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/features/user/services/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];
    const bearerToken = authHeader.split(' ');

    if (!bearerToken[1]) {
      return false;
    }

    try {
      const tokenExist = await this.userService.findUserByToken(bearerToken[1]);
      if (tokenExist === undefined) return false;

      const decodedToken = this.jwtService.verify(bearerToken[1]);
      request.matricule = decodedToken;
      const isNotExpired = this.isDateNotExpired(request.matricule.exp);
      if (isNotExpired) return true;
      return false;
    } catch (error) {
      return false;
    }
  }

  async isDateNotExpired(expirationDate: number): Promise<boolean> {
    const currentDate = moment();
    const expirationDateTime = moment.unix(expirationDate);

    return expirationDateTime.isAfter(currentDate);
  }
}
