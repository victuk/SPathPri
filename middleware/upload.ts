import * as uuid from 'uuid'
import { } from '../constants/ENV';
import path from 'path'
import { S3Client } from '@aws-sdk/client-s3';
import multer = require('multer');
import aws = require('aws-sdk');
import multerS3 = require('multer-s3');

aws.config.update({
    secretAccessKey: process.env.S3_SECRET,
    accessKeyId: process.env.S3_ACCESS_KEY,
    region: 'us-east-2',
});

const s3 = new S3Client({});

const fileExtensions = [".jpg", ".jpeg", ".png", ".PNG", ".JPG", ".pdf", ".docx", ".doc", ".mp3"];

const fileFilter: multer.Options["fileFilter"] = (_, file, callback) => {

    let fileExtension = path.extname(file.originalname);

    if (!fileExtensions.includes(fileExtension)) {

        callback(new Error(`File type is not supported!! The supported file extensions are: ${JSON.stringify(fileExtensions)}`));

        return;
    }

}

const upload = multer({

    fileFilter,

    storage: multerS3({
        acl: "public-read",
        s3,
        bucket: '',

        metadata: (_, file, next) => {
            next(null, { fieldName: file.fieldname })
        },

        key: (_, file, calback) => {
            const fileExtension = path.extname(file.originalname);
            const newFileName = `${(Date.now() || (new Date).getTime())}-${uuid.v4()}${fileExtension}` as const;
            calback(null, newFileName);
        },
    }),
});

export default upload;
