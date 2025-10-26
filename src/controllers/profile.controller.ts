import { Request, Response } from "express";
import prisma from "../db/db.config";
export const getProfile = async (req: Request, res: Response) => {
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
        userInfo
    })
    return;
}

