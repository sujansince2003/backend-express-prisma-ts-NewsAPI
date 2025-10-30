
import type { NewsWithUserType } from "../types/news.types";

function ImgPath(imgName: string): string {
    const imgpath = `${process.env.BACKEND_URL}/uploads/coverimgs/${imgName}`
    return imgpath
}


export function TransformNewsResponse(news: NewsWithUserType) {
    return {
        ...news,
        coverImg: news.coverImg ? ImgPath(news.coverImg) : null,

    };
}