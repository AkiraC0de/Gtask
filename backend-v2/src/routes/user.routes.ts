import { Router } from "express";

import formValidator from "../middlewares/formValidator";

import { registerSchema } from "../validations/validatorSchemas";
import { registerController } from "../controllers/user.controllers";

const userRoute = Router()

userRoute.post("/register", formValidator(registerSchema), registerController)

export default userRoute