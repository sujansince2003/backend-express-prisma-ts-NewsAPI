import nodemailer from "nodemailer";
import logger from "./Logger";

// setting up transporter for mail 
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_CLIENT_MAIL,
        pass: process.env.GMAIL_PASSWORD
    }
})

// verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        logger.error('SMTP connection error: ' + (error as Error).message)
    } else {
        logger.info('SMTP server ready')
    }
})

// function to send mail
const sendMail = async ({ userMail, subject, mailContent }: { userMail: string, subject: string, mailContent: string }) => {
    try {
        if (!userMail || !subject || !mailContent) {
            throw new Error('Missing required email parameters')
        }

        const info = await transporter.sendMail({
            from: `"Suzan Labs" <${process.env.GMAIL_CLIENT_MAIL}>`,
            to: userMail,
            subject: subject,
            html: mailContent
        })

        logger.info(`Email sent successfully to ${userMail}`);
        return info
    } catch (error) {
        logger.error('Email sending failed: ' + (error as Error).message);
        throw error
    }
}

export default sendMail;