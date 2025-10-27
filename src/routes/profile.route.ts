import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profile.controller";
import verifyToken from "../middlwares/auth.middleware";

const profileRouter = Router()

profileRouter.get("/getprofile", verifyToken, getProfile)
profileRouter.put("/updateprofile/:id", verifyToken, updateProfile)

export default profileRouter



