import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            userId?: string
        }
    }
}


export default function verifyToken(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.auth_token ||

        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        res.status(401).json({
            msg: "unathorized"
        })
        return;
    }
    console.log(token)
    try {

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
        req.userId = (decodedToken as JwtPayload).userId;
        next();

    } catch (error) {
        res.status(401).json({ msg: " unauthorized" });
        return;
    }





}