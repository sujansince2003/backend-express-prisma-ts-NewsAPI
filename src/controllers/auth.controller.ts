import prisma from "../db/db.config";
import { NextFunction, Response, Request } from "express"

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { UserAuthSchema, UserLoginSchema } from "../validations/userAuthValidator";
export const GetAllUsers = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    res.json(users);
    return;
}


export const RegisterUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body;
        const validate = UserAuthSchema.safeParse(body);
        if (!validate.success) {
            const errors = validate.error.format();
            res.status(400).json({ errors });
            return;
        }

        const { username, email, password } = validate.data

        const userExists = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if (userExists) {
            res.status(409).json({ message: "User already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);



        const createUser = await prisma.user.create({
            data: {
                username,
                email,
                role: "USER",
                password: hashedPassword
            }
        })

        res.status(201).json({ message: "User created successfully", user: createUser });
        return;

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }






}

export const LoginUser = async (req: Request, res: Response) => {


    const body = req.body;

    const validate = UserLoginSchema.safeParse(body);

    if (!validate.success) {
        res.status(400).json({ msg: "invalid data " })
        return;
    }

    const { email, password } = validate.data;



    try {


        const userExist = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (!userExist) {
            res.status(400).json("user doesnot exist.please create account")
            return;
        }

        const passwordMatch = await bcrypt.compare(password, userExist.password);

        if (!passwordMatch) {
            res.status(401).json({
                msg: "password didnot match"
            })
        }
        // generate json web token

        const token = jwt.sign({
            userId: userExist.id

        }, process.env.JWT_SECRET_KEY as string, { expiresIn: "1d" })

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "strict"
        })

        res.status(200).json({
            msg: "loggedin success",
            userId: userExist.id
        })
        return;
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "error occured", Err: error });
        return;

    }


}


export const LogoutUser = async (req: Request, res: Response) => {
    res.clearCookie("auth_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    })
    res.status(200).json({
        message: "logout successfully"
    })
    return
}


