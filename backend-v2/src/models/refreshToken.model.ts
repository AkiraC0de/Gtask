import mongoose from "mongoose"

export const REFRESH_TOKEN_EXP = 1000 * 60 * 60 * 24 * 30 // 30 days

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  expireAt: {
    type: Date,
    default: Date.now() + REFRESH_TOKEN_EXP,
    required: true
  },
})

// Create a TTL index with 0 seconds delay so it deletes at the exact Date
refreshTokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export type RefreshToken = mongoose.InferSchemaType<typeof refreshTokenSchema>

const RefreshTokenModel = mongoose.model("RefreshToken", refreshTokenSchema)
export default RefreshTokenModel