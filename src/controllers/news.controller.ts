import { Request, Response } from "express";
import { createNewsSchema } from "../validations/newsValidation";
import prisma from "../db/db.config";
import { UploadedFile } from "express-fileupload";
import { ImgValidator, uniqueIdGenerator } from "../utils/helper.utils";
import { TransformNewsResponse } from "../utils/transformResponse.utils";
import type { NewsWithUserType } from "../types/news.types";
import { deleteImage } from "../utils/deleteImage";
import redisClient from "../redisClient/client.redis";

type newsDataType = {
    title: string,
    content: string

}

export const getAllNews = async (req: Request, res: Response) => {
    try {
        let page = Number(req.query.page) || 1
        let limit = Number(req.query.limit) || 10;
        if (page <= 0) {
            page = 1
        }
        if (limit < 0 || limit > 100) {
            limit = 10
        }
        const skip = (page - 1) * limit


        // cache key
        const cacheKey = `news:all:${page}:${limit}`

        // get cached data
        const cachedNewsData = await redisClient.get(cacheKey)
        if (cachedNewsData) {
            const parsedNewsData = JSON.parse(cachedNewsData)
            res.status(200).json({
                message: "news fetched successfully",
                data: parsedNewsData,

            })
            return;
        }


        const totalNews = await prisma.news.count()
        const newsData = await prisma.news.findMany({
            take: limit,
            skip: skip, orderBy: {
                createdAt: "desc"   // or "asc"
            },
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



        await redisClient.set(cacheKey, JSON.stringify(transformedNews), 'EX', 60);

        res.status(200).json({
            message: "news fetched successfully",
            data: transformedNews,
            metadata: {
                currentPage: page,
                totalPages: Math.ceil(totalNews / limit),
                totalNews: totalNews,

            }
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

export const getNews = async (req: Request, res: Response) => {

    const newsId = req.params.newsid;
    if (!newsId) {
        res.status(400).json({
            message: "news  ID is required",
            data: []
        })
        return
    }
    const cacheKey = `news:${newsId}`
    // get cached data

    try {

        const cachednews = await redisClient.get(cacheKey)
        const newscacheddata = cachednews ? JSON.parse(cachednews) : null;
        if (cachednews) {
            res.status(200).json({
                message: "News fetched successfully",
                data: newscacheddata
            })
            return
        }
        const newsData = await prisma.news.findUnique({
            where: {
                id: Number(newsId)
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        profile: true
                    }
                }
            }
        })

        if (!newsData) {
            res.status(404).json({
                message: "News not found",
                data: []
            })
            return
        }

        const newsdata = TransformNewsResponse(newsData);
        await redisClient.set(cacheKey, JSON.stringify(newsdata), 'EX', 60);

        res.status(200).json({
            message: "News fetched successfully",
            data: newsdata
        })
        return


    } catch (error) {
        res.status(500).json({
            message: "something went wrong",
            data: []
        })
        return

    }




}


async function deleteAllNewsCache() {
    const keys = await redisClient.keys('news:all:*');
    if (keys.length > 0) {
        await redisClient.del(...keys);
    }
}

export const updateNews = async (req: Request, res: Response) => {

    const newsId = req.params.newsid;
    const userId = req.userId;
    const rawnewsdata = req.body
    if (!newsId) {
        res.status(400).json({
            message: "news  ID is required",
            data: []
        })
        return
    }
    if (!userId) {
        res.status(400).json({
            message: "user ID is required",
            data: []
        })
        return
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: Number(userId)
            }
        })
        if (!user) {
            res.status(400).json({
                message: "user not found",
                data: []
            })
            return
        }
        const newsData = await prisma.news.findUnique({
            where: {
                id: Number(newsId)
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        profile: true
                    }
                }
            }
        })
        if (!newsData) {
            res.status(404).json({
                message: "News not found",
                data: []
            })
            return
        }
        if (newsData?.user.id !== user?.id) {
            res.status(401).json({
                message: "You are not authorized to update the news"
            })
            return
        }
        const validateNewsData = createNewsSchema.safeParse(rawnewsdata);
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

        if (!coverImg?.name) {
            res.status(400).json({
                message: "Invalid file name"
            })
            return;
        }

        const imgExtension = coverImg.name.split(".");
        const uniquecoverimgname = uniqueIdGenerator() + "." + imgExtension[1];
        const uploadPath = process.cwd() + "/src/uploads/coverimgs/" + uniquecoverimgname
        coverImg.mv(uploadPath, (err) => {
            if (err) throw err
        })

        deleteImage("coverImg", newsData?.coverImg as string)
        await prisma.news.update({
            where: { id: newsData.id },
            data: {
                title: title || newsData.title,
                content: content || newsData.content,
                coverImg: uniquecoverimgname || newsData.coverImg
            }
        })
        const updatedNewsWithUser = await prisma.news.findUnique({
            where: { id: Number(newsId) },
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
        const updatednewsdata = updatedNewsWithUser ? TransformNewsResponse(updatedNewsWithUser) : null;

        await redisClient.del(`news:${newsId}`)
        await deleteAllNewsCache()

        res.status(200).json({
            message: "News updated successfully",
            data: updatednewsdata
        })
        return


    } catch (error) {
        res.status(500).json({
            message: "something went wrong",
            data: []
        })
        return

    }




}


export const deleteNews = async (req: Request, res: Response) => {

    const newsId = req.params.newsid;
    const userId = req.userId;

    if (!newsId) {
        res.status(400).json({
            message: "news  ID is required",
            data: []
        })
        return
    }
    if (!userId) {
        res.status(400).json({
            message: "user ID is required",
            data: []
        })
        return
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: Number(userId)
            }
        })
        if (!user) {
            res.status(400).json({
                message: "user not found",
                data: []
            })
            return
        }

        const newsData = await prisma.news.findUnique({
            where: {
                id: Number(newsId)
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        profile: true
                    }
                }
            }
        })

        if (!newsData) {
            res.status(404).json({
                message: "News not found",
                data: []
            })
            return
        }

        if (newsData.user.id !== user.id) {
            res.status(401).json({
                message: "You are not authorized to delete the news"
            })
            return
        }

        deleteImage("coverImg", newsData?.coverImg as string)
        const deleteNews = await prisma.news.delete({
            where: {
                id: Number(newsId)
            }
        })
        await redisClient.del(`news:${newsId}`)
        await deleteAllNewsCache()

        res.status(200).json({
            message: "News deleted successfully",
            data: []
        })
        return


    } catch (error) {
        res.status(500).json({
            message: "something went wrong",
            data: []
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

        if (!coverImg?.name) {
            res.status(400).json({
                message: "Invalid file name"
            })
            return;
        }

        const imgExtension = coverImg.name.split(".");
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
        await deleteAllNewsCache()
        res.status(201).json({
            message: "news created successfully!!",
            data: createNewsData
        })
        return

    } catch (error) {
        res.status(500).json({
            message: "Error occured",
            errorMsg: error
        })
        return
    }
}


