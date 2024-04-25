import * as path from 'path';
import { diskStorage } from 'multer';
import * as fs from 'fs';

export const multerMultiplesOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      let uploadPath = '';

      if (file.fieldname === 'cover') {
        uploadPath = './uploads/images';
      } else if (file.fieldname === 'pdf') {
        uploadPath = './uploads/pdf';
      }

      fs.mkdirSync(uploadPath, { recursive: true });

      cb(null, uploadPath);
    },
    filename: (req, file, callback) => {
      const lastDotIndex = file.originalname.lastIndexOf('.');

      const name = file.originalname.substring(0, lastDotIndex);
      const ext = file.originalname.substring(lastDotIndex + 1);
      const newName = name.replaceAll(' ', '_') + '_' + Date.now() + '.' + ext;
      callback(null, newName); // add file filter
    },
  }),
};
