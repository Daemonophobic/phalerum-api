import { model, Schema } from 'mongoose';
import UserDto from '../data/DataTransferObjects/UserDto';

const userSchema = new Schema<UserDto>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    emailAddress: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    createdAt: {
      type: Schema.Types.Date,
      default: Date.now
    },
    password: {
        type: String,
        required: false,
        select: false,
    },
    OTPSecret: {
        type: {cipher: String, iv: String},
        required: false,
        select: false,
    },
    initializationToken: {
        type: {cipher: String, iv: String},
        required: true,
        select: false,
    },
    authenticationAttempts: {
        type: Number,
        default: 0,
        select: false,
    },
    locked: {
        type: Boolean,
        default: true,
        select: false,
    },
    roles:[{ 
      type: Schema.Types.ObjectId, 
      ref: 'Role',
      default: [], 
      select: false,
  }]
  },
  {
    timestamps: true,
  },
);

const userModel = model('User', userSchema);

export default userModel;