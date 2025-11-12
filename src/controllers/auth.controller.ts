import prisma from "../db/db.config";
import { NextFunction, Response, Request } from "express"

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { UserAuthSchema, UserLoginSchema } from "../validations/userAuthValidator";
import logger from "../utils/Logger";
import sendMail from "../utils/sendmail";
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
            logger.info(`Registration validation failed for email: ${body.email}`);
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
            logger.info(`Registration attempt for existing user: ${email}`);
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

        logger.info(`User registered successfully: ${email}`);
        // send mail to user
        const subject = "Welcome to Suzan Labs";
        const mailContent = `
        <h3>Greeting ${createUser.username} </h3>
         <h5>Welcome to Suzan News. Thank you for registering  </h5>
         `
        try {
            await sendMail({
                userMail: createUser.email,
                subject,
                mailContent,
            });

            logger.info(`Welcome email sent to: ${createUser.email}`);
        } catch (error) {
            logger.error(` Error sending welcome email to: ${createUser.email} - ${(error as Error).message}`);
        }

        res.status(201).json({ message: "User created successfully", user: createUser });
        return;

    } catch (error) {
        logger.error("Registration error: " + (error as Error).message);
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
            logger.info(`Login attempt for non-existent user: ${email}`);
            res.status(400).json("user doesnot exist.please create account")
            return;
        }

        const passwordMatch = await bcrypt.compare(password, userExist.password);

        if (!passwordMatch) {
            logger.info(`Failed login attempt for user: ${email}`);
            res.status(401).json({
                msg: "password didnot match"
            })
            return;
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

        logger.info(`User logged in successfully: ${email}`);
        res.status(200).json({
            msg: "loggedin success",
            userId: userExist.id
        })
        return;
    } catch (error) {
        logger.error("Login error: " + (error as Error).message);
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
    logger.info("User logged out successfully");
    res.status(200).json({
        message: "logout successfully"
    })
    return
}


