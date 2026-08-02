import mongoose, { CustomAggregationExpressionOperatorReturningAny } from "mongoose"

export const SESSION_TOKEN_EXP = 1000 * 60 * 15 // 15 mins

export const SESSION_TYPE = {
  EMAIL_VERIFICATION: "email_verification",
  REQ_RESET_PASS: "request_reset_password",
  RESET_PASS: "reset_password"
} as const

const sessionTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: Object.keys(SESSION_TYPE),
    required: true,
  },
  expireAt: {
    type: Date,
    default: Date.now() + SESSION_TOKEN_EXP,
    required: true
  },
})


sessionTokenSchema.index({ type: 1 });
sessionTokenSchema.index({ userId: 1, type: 1})
// Create a TTL index with 0 seconds delay so it deletes at the exact Date
sessionTokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export type SessionToken = mongoose.InferSchemaType<typeof sessionTokenSchema>

const SessionTokenModel = mongoose.model("SessionToken", sessionTokenSchema)
export default SessionTokenModel