import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import sendMail from "../utils/sendmail";
import logger from "../utils/Logger";

const connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null
});
console.log("started");
const worker = new Worker(
    "foo",
    async (job) => {
        const { userMail, subject, mailContent } = await job.data;
        await sendMail({ userMail, subject, mailContent });
        logger.info("Email sending worker finished")
    },
    { connection }
);
worker.on("completed", (job) => {
    console.log(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
    console.log(` has failed with ${err.message}`);
});
