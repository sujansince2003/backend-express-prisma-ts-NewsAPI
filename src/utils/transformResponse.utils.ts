
import { newsType } from "../validations/newsValidation";


function ImgPath(imgName: string): string {
    const imgpath = `${process.env.BACKEND_URL}/uploads/coverimgs/${imgName}`
    return imgpath
}


export function TransformNewsResponse(news: newsType) {
    return {
        id: news.id,
        title: news.title,
        content: news.content,
        coverImg: news.coverImg ? ImgPath(news.coverImg) : null,
        userId: news.userId,
        createdAt: news.createdAt,
        updatedAt: news.updatedAt,
    };
}