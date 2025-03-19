import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import Datauri from 'datauri';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import "dotenv/config"
import {promises as fs, mkdirSync, rmdirSync} from "fs";

type FileType = "image" | "file";

/**
* @description This function converts the buffer to data url
* @param {Object} req containing the field object
* @returns {String} The data url from the string buffer
*/
// export { multerUploads, dataUri };

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
  });



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/')
    },
    filename: function (req, file, cb) {
      console.log(file);
      cb(null, uuidv4() + '.' + file.originalname.split(".")[file.originalname.split(".").length - 1])
    }
  })
  
const multerUpload = multer({ storage: storage })

async function uploadToCloudinary(fileOrFiles:string | Array<string>, fileType: FileType = "image"): Promise<any> {
  try {
      var uploadPreset:string;
        if(fileType == "image") {
            uploadPreset = "verbicle_images_test";
        } else if(fileType == "file") {
            uploadPreset = "verbicle_files_test"
        } else {
          return;
        }

        if(typeof(fileOrFiles) == "string") {
          const fileProps = await cloudinary.uploader.upload(fileOrFiles, {
            folder: uploadPreset
        });
        // await fs.unlink(fileOrFiles);
        return fileProps;
        } else if(typeof(fileOrFiles) == "object") {
          const filesProps:any  = [];
          for(let i = 0; i < fileOrFiles.length; i++) {
            console.log(uploadPreset);
            filesProps.push(await cloudinary.uploader.upload(fileOrFiles[i], {
              folder: uploadPreset
          }));
            // await fs.unlink(fileOrFiles[i]);
          }
          return filesProps;
        } else {
          return;
        }
        
    } catch (error) {
        console.log(error);
        return error;
    }
}

export {
    uploadToCloudinary,
    multerUpload
};