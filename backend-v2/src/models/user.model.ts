import mongoose from "mongoose"
import bcryptjs from "bcryptjs"


export const USER_SEX = {
  MALE: "male",
  FEMALE: "female",
  RATHER_NOT_SAY: "rather_not_say"
} as const;

export const USER_ACCOUNT_STATUS = {
  UNVERIFIED: "unverified",
  VERIFIED: "verified",
  BANNED: "banned"
} as const;

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    maxlength: 100,
    trim: true   
  },
  lastName: {
    type: String,
    maxlength: 100,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    trim: true,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    required: true
  }, 
  passwordHash: {
    type: String,
    required: true
  },
  sex : {
    type: String,
    enum: Object.values(USER_SEX),
    required: true
  },
  status: {
    type: String,
    enum: Object.values(USER_ACCOUNT_STATUS),
    default: USER_ACCOUNT_STATUS.UNVERIFIED,
    required: true
  }
}, {
  timestamps: true 
})

export type User = mongoose.InferSchemaType<typeof userSchema>

const UserModel = mongoose.model("User", userSchema)
export default UserModel