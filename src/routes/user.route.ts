import { Router } from "express";
import { RegisterUser, LoginUser, GetAllUsers, LogoutUser } from "../controllers/auth.controller";
import verifyToken from "../middlwares/auth.middleware";
import Redisclient from "../redisClient/client.redis";
import axios from "axios";


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

userRouter.get("/todos", async (req, res) => {
    const todosfromredis = await Redisclient.get("todos")
    if (todosfromredis) {
        const tododata = JSON.parse(todosfromredis)


        res.json({
            msg: "got from redis",
            data: tododata

        })
        return
    }
    const { data: todos } = await axios.get("https://jsonplaceholder.typicode.com/todos")
    const todosdata = todos
    await Redisclient.set("todos", JSON.stringify(todosdata), "EX", 60)
    res.json({
        msg: "got from api",
        data: todosdata
    })
    return



})



export default userRouter;