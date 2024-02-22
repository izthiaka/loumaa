import { Injectable } from '@nestjs/common';
import { UserSession } from '../../entities/user_session/user_session.schema';
import { Model, ObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserSessionService {
  constructor(
    @InjectModel(UserSession.name)
    private readonly userSessionModel: Model<UserSession>,
  ) {}

  async updateSession(userId: ObjectId, sessionData: object): Promise<any> {
    try {
      return this.userSessionModel
        .updateOne({ user: userId }, sessionData, { upsert: true })
        .exec();
    } catch (error) {
      throw Error(error);
    }
  }

  async deleteSession(userId: ObjectId): Promise<any> {
    try {
      return this.userSessionModel.deleteOne({ user: userId }).exec();
    } catch (error) {
      throw Error(error);
    }
  }

  async findOneSession(userId: ObjectId): Promise<any> {
    try {
      return this.userSessionModel.findOne({ user: userId }).exec();
    } catch (error) {
      throw Error(error);
    }
  }
}
