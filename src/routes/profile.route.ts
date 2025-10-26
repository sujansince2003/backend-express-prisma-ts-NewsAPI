import { Router } from "express";
import { getProfile } from "../controllers/profile.controller";
import verifyToken from "../middlwares/auth.middleware";

const profileRouter = Router()

profileRouter.get("/getprofile", verifyToken, getProfile)

export default profileRouter



