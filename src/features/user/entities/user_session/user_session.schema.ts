import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../user/user.schema';

@Schema({ timestamps: true })
export class UserSession extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ required: false })
  token: string;

  @Prop({ required: false })
  refresh_token: string;

  @Prop({ required: false })
  device: string;
  updatedAt: Date;
}

export const UserSessionSchema = SchemaFactory.createForClass(UserSession);
