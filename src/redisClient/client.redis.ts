import { Redis } from "ioredis"
import logger from "../utils/Logger"

const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,

})

redisClient.on('connect', () => {
    logger.info('Redis client connected successfully')
})

redisClient.on('error', (err) => {
    logger.error('Redis connection error: ' + (err as Error).message)
})

redisClient.on('close', () => {
    logger.info('Redis connection closed')
})

redisClient.on('reconnecting', () => {
    logger.info('Redis client reconnecting...')
})

export default redisClient
