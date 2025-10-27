import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from 'uuid';
const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 2 * 1024 * 1024;

export interface validationResult {
    valid: boolean,
    error?: string
}

export const ImgValidator = (file?: UploadedFile): validationResult => {

    if (!file) {
        return { valid: false, error: "no file uploaded" }
    }
    if (!allowedTypes.includes(file.mimetype)) {
        return { valid: false, error: "file type must be image" }

    }
    if (file.size > MAX_SIZE) {
        return { valid: false, error: "file size must be less than 2mb" }

    }

    return { valid: true }



}


