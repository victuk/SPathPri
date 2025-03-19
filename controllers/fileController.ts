import { NextFunction, Response } from 'express';
import { CustomRequest } from '../middleware/authenticatedUsersOnly';
import { uploadObjectFromFS } from '../utils/AWSFileUpload';
import fs from "fs";

export const fileUpload = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        
        const result = await uploadObjectFromFS(req.file!!.path, req.file!!.originalname);

        res.send({
            result
        });

    } catch (error) {
        next(error);
    } finally {
        fs.unlinkSync(req.file!!.path);
    }
}
