import { z } from "zod"
export const newsSchema = z.object({
    id: z.number().int(),
    userId: z.number().int(),
    title: z.string(),
    content: z.string(),
    coverImg: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date()
})

export const createNewsSchema = z.object({
    title: z.string(),
    content: z.string(),

})

export const updateNewsSchema = z.object({
    title: z.string().nullable(),
    content: z.string().nullable(),
    coverImg: z.string().nullable()
})

