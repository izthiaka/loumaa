import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserSession,
  UserSessionSchema,
} from '../entities/user_session/user_session.schema';
import { UserSessionService } from '../services/user_session/user_session.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserSession.name, schema: UserSessionSchema },
    ]),
  ],
  providers: [UserSessionService],
  exports: [UserSessionService, MongooseModule],
})
export class UserSessionModule {}
