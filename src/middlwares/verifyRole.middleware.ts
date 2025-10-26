import { Request, Response, NextFunction } from "express";
import prisma from "../db/db.config";

async function verifyRole(req: Request, res: Response, next: NextFunction) {


    try {
        const userId = req.userId;
        const userData = await prisma.user.findUnique({
            where: {
                id: parseInt(userId as string)
            }
        })

        const userRole = userData?.role;
        if (userRole !== "ADMIN") {
            res.status(401).json({
                status: "failed",
                message: "You are not authorized to view this page.",
            })
            return;
        }

        next();


    } catch (error) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }








}