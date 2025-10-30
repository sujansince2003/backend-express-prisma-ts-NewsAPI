import { Router } from "express";
import { CreateNews, getNews } from "../controllers/news.controller";
import verifyToken from "../middlwares/auth.middleware";

const router = Router()


router.get("/allnews", getNews)
router.post("/createnews", verifyToken, CreateNews)


export default router