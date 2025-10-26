import { Router } from "express";
import { RegisterUser, LoginUser, GetAllUsers, LogoutUser } from "../controllers/auth.controller";
import verifyToken from "../middlwares/auth.middleware";


const userRouter = Router();

userRouter.get("/", GetAllUsers);
userRouter.post("/register", RegisterUser);
userRouter.post("/login", LoginUser);
userRouter.post("/logout", LogoutUser);
userRouter.get("/profile", verifyToken, (req, res) => {
    res.json({
        status: "success",
        data: {
            user: req.userId
        }
    });
});

export default userRouter;