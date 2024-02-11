import * as moment from 'moment';
import { UserSession } from '../entities/user_session.schema';

export class UserSessionSpecificFieldDto {
  device: string;
  at: string;

  constructor(userSession: UserSession) {
    this.device = userSession.device;
    this.at = moment(userSession.updatedAt).fromNow();
  }
}
