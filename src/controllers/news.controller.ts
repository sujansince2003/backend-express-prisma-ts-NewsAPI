import { Request, Response } from "express";
import { createNewsSchema } from "../validations/newsValidation";
import prisma from "../db/db.config";
import { UploadedFile } from "express-fileupload";
import { ImgValidator, uniqueIdGenerator } from "../utils/helper.utils";
import { TransformNewsResponse } from "../utils/transformResponse.utils";
import type { NewsWithUserType } from "../types/news.types";

type newsDataType = {
    title: string,
    content: string

}

export const getNews = async (req: Request, res: Response) => {

    try {
        const newsData = await prisma.news.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        profile: true


                    }
                }
            }
        });
        if (!newsData) {
            res.status(400).json({
                message: "Failed to get news data",

            })
            return
        }

        const transformedNews = newsData.map((news: NewsWithUserType) =>
            TransformNewsResponse(news)
        );
        res.status(201).json({
            message: "news fetched successfully",
            data: transformedNews
        })
        return;

    } catch (error: any) {
        res.status(500).json({
            message: "Error occured",
            error: error.message
        })
        return
    }



}

export async function CreateNews(req: Request, res: Response) {


    try {


        const userId = req.userId;
        if (!userId) {
            res.status(400).json({
                message: "User ID is required",
                data: []
            })
            return
        }

        const user = await prisma.user.findUnique({
            where: {
                id: Number(userId)
            }
        })
        if (!user) {
            res.status(400).json({
                message: "User not found",
                data: []
            })
            return
        }


        const newsData = req.body;
        const validateNewsData = createNewsSchema.safeParse(newsData);
        if (!validateNewsData.success) {
            res.status(400).json({
                message: "Validation failed for news data",
                errors: validateNewsData.error.message
            })
            return
        }
        const { title, content } = validateNewsData.data;

        const coverImg = req.files?.coverImg as UploadedFile;
        const isvalidImg = ImgValidator(coverImg);
        if (!isvalidImg.valid) {
            res.status(400).json({
                message: isvalidImg.error
            })
            return;
        }

        const imgExtension = coverImg?.name.split(".");
        const uniquecoverimgname = uniqueIdGenerator() + "." + imgExtension[1];
        const uploadPath = process.cwd() + "/src/uploads/coverimgs/" + uniquecoverimgname
        coverImg.mv(uploadPath, (err) => {
            if (err) throw err
        })







        const createNewsData = await prisma.news.create({
            data: {
                title: title,
                content: content,
                coverImg: uniquecoverimgname,
                userId: Number(userId)
            }
        })

        res.status(201).json({
            message: "news created successfully!!",
            data: createNewsData
        })

    } catch (error) {
        res.status(500).json({
            message: "Error occured",
            errorMsg: error
        })
    }
}