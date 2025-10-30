import express, { Request, Response } from "express"
import cors from "cors"
import fileupload from "express-fileupload"
import userRouter from "./routes/user.route";
import cookieParser from 'cookie-parser';
import profileRouter from "./routes/profile.route";
import newsRouter from "./routes/news.route"
const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("src/uploads/images"));     //for profile pictures
app.use("/uploads", express.static("src/uploads/coverimgs"));   //for coverimgs

// http://localhost:8000/uploads/{filename}

app.use(fileupload());
app.use(cors());
app.use("/api/user", userRouter);
app.use("/api/profile", profileRouter);
app.use("/api/news", newsRouter);


app.get("/", (req: Request, res: Response) => {

    res.json({ msg: "hello soham" })
})

app.listen(8000, () => {
    console.log("BACKEND SERVER::running in port  8000. visit: http://localhost:8000")
})
