import { Prisma } from "@prisma/client";

export type NewsWithUserType = Prisma.NewsGetPayload<{
    include: {
        user: {
            select: {
                id: true,
                username: true,
                profile: true
            }
        }
    }
}>