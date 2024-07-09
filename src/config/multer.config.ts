import * as multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config();

const allowedExtention = ['jpg', 'jpeg', 'png', 'gif'];

const edp = 'https://kr.object.ncloudstorage.com/';
const region = 'kr-standard';

const s3 = new S3Client({
  endpoint: edp,
  region: region,
  credentials: {
    accessKeyId: process.env.ACCESSKEY,
    secretAccessKey: process.env.SECRETACCESSKEY,
  },
});

export const multerOptions = {
  storage: multerS3({
    s3,
    bucket: 'image-bucket',
    acl: 'public-read',
    key: (req, file, cb) => {
      const uuid = uuidv4();
      const extension = file.originalname.split('.').pop();
      const fileName = `${uuid}.${extension}`;
      console.log(fileName);
      if (!allowedExtention.includes(extension)) {
        return cb(new Error('Wrong extension'), false);
      }
      cb(null, fileName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 크기 제한
  },
};
