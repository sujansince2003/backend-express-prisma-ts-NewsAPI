import { Request, Response } from "express";
import prisma from "../db/db.config";
import { ImgValidator, uniqueIdGenerator } from "../utils/helper.utils";
import { UploadedFile } from "express-fileupload";

export const getProfile = async (req: Request, res: Response) => {

    try {
        const userId = req.userId;
        if (!userId) {
            res.status(400).json({
                message: "unathorizedeee"
            })
            return;
        }
        const userInfo = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                profile: true,
                createdAt: true,
            },
        });

        if (!userInfo) {
            res.status(500).json({
                message: "Failed to fetch the data"
            })
            return;
        }
        res.status(200).json({
            message: "User info fetched successfully",
            data: userInfo
        })
        return;
    } catch (error) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
        return;

    }
}

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id
        const profile = req.files?.profile as UploadedFile;

        const isValidImg = ImgValidator(profile);
        if (!isValidImg.valid) {
            res.status(400).json({
                message: isValidImg.error
            })
            return;
        }
        const imgextension = profile?.name.split(".");
        const uniqueImgName = uniqueIdGenerator() + "." + imgextension[1];
        const uploadPath = process.cwd() + "/src/uploads/images/" + uniqueImgName

        profile.mv(uploadPath, (err) => {
            if (err) throw err
        })


        await prisma.user.update({
            data: {
                profile: uniqueImgName
            },
            where: {
                id: Number(userId)
            }
        })
        res.status(200).json({
            message: "profile picture updated successfully",
            data: []
        })
        return









    } catch (error) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
        return;

    }




}