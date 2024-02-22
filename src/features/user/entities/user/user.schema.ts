import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Role } from '../role/role.schema';
import UserStatusAccount from 'src/core/constant/user_status_account';
import { IsIn } from 'class-validator';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  matricule: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  gender: string;

  @Prop({ required: false, unique: true, sparse: true })
  email: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({
    required: true,
    default: UserStatusAccount.getPendingStatusLibelle(),
    validate: {
      validator: (value: string) =>
        UserStatusAccount.validation.includes(value),
      message: (props: { value: any }) =>
        `${props.value} n'est pas un statut valide.`,
    },
  })
  @IsIn(UserStatusAccount.validation, { message: 'Status invalid.' })
  status: string;

  @Prop({ required: false })
  photo: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Role' })
  role: Role;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  identifier_token: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
