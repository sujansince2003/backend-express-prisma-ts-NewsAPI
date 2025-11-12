import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null
});
export const emailQueue = new Queue("foo", { connection });

// export async function addJobs() {
//     await emailQueue.add("myJobName", { foo: "bar" });
//     await emailQueue.add("myJobName", { qux: "baz" });
// }


