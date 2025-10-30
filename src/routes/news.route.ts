import { Router } from "express";
import { CreateNews, getNews, getAllNews } from "../controllers/news.controller";
import verifyToken from "../middlwares/auth.middleware";

const router = Router()


router.get("/allnews", getAllNews)
router.get("/getnews/:newsid", getNews)
router.post("/createnews", verifyToken, CreateNews)


export default router