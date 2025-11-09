
import fs from "fs";

const IMAGE_PATHS = {
    coverImg: "/src/uploads/coverimgs/",
    profileImg: "/src/uploads/images/"
} as const;

type ImageType = keyof typeof IMAGE_PATHS;

const deleteFileIfExists = (filePath: string): void => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

export const deleteImage = (imgType: ImageType, imagename: string): string => {
    if (!imgType || !imagename) {
        return "Image type and filename are required";
    }

    const basePath = IMAGE_PATHS[imgType];
    if (!basePath) {
        return "Invalid image type";
    }

    const fullPath = process.cwd() + basePath + imagename;
    deleteFileIfExists(fullPath);

    return `${imgType} deleted successfully`;
};
