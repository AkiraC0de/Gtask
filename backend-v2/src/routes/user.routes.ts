import { Router } from "express";

import { registerController } from "../controllers/user.controllers";

const userRoute = Router()

userRoute.post("/register", registerController)

export default userRoute