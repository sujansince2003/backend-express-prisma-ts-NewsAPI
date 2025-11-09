import { Router } from "express";
import { CreateNews, getNews, getAllNews, updateNews, deleteNews } from "../controllers/news.controller";
import verifyToken from "../middlwares/auth.middleware";

const router = Router()


router.get("/allnews", getAllNews)
router.get("/getnews/:newsid", getNews)
router.post("/createnews", verifyToken, CreateNews)
router.post("/updatenews", verifyToken, updateNews)
router.post("/deletenews/:newsid", verifyToken, deleteNews)


export default router