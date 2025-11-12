import winston from "winston";

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
    })
)

const logger = winston.createLogger({
    level: "info",
    format: logFormat,
    transports: [
        new winston.transports.Console(), // show logs in terminal
        new winston.transports.File({ filename: "logs/error.log", level: "error" }), // only errors
        new winston.transports.File({ filename: "logs/combined.log" }), // all logs
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: "logs/exceptions.log" }),
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: "logs/rejections.log" }),
    ],
})

export default logger;