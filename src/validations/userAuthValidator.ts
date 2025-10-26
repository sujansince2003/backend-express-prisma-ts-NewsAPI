import * as z from "zod";

const UserAuthSchema = z.object({
    username: z.string().min(2).max(100),
    email: z.email(),
    password: z.string()

})

const UserLoginSchema = z.object({

    email: z.email(),
    password: z.string()

})

export { UserLoginSchema, UserAuthSchema }


