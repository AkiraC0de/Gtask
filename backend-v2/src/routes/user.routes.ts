import { Router } from "express";

import formValidator from "../middlewares/formValidator";

import { registerSchema } from "../config/validatorSchemas";

const userRoute = Router()

userRoute.post("/register", formValidator(registerSchema), (req, res) => {
  res.status(200).json("TEST")
})

export default userRoute