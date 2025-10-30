import { Router } from "express";
import { CreateNews } from "../controllers/news.controller";
import verifyToken from "../middlwares/auth.middleware";

const router = Router()

router.post("/createnews", verifyToken, CreateNews)


export default router