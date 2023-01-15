const multer = require('multer');
const fs = require('fs');
const path = require('path');

let filesStorgePath = [];

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    console.log('file', req);
    callback(null, process.env.imageStoragePath);
  },
  filename: (req, file, callback) => {
    console.log('filefilefilefile', req);
    const extension = path.extname(file.originalname);
    const baseName = path.parse(file.originalname).name;
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const date = new Date().getDate();
    let hour = new Date().getHours();
    let minute = new Date().getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour %= 12;
    hour = hour || 12;
    minute = minute < 10 ? `0${minute}` : minute;
    const updatedFile = `${baseName}_${date}_${month}_${year}_${hour}_${minute}_${ampm}${extension}`;
    callback(null, updatedFile);
  }
});

const upload = multer({ storage: storage }).array('uploader', process.env.maxUploadVideo);

const uploadFile = {};

uploadFile.saveImage = (req, res, next) => {
  // eslint-disable-next-line consistent-return
  upload(req, res, (err) => {
    if (err) return Promise.reject(err);
    next();
  });
};

/*
 *deleteFile() is for delete the files.
 */
const deleteSingleFile = (imageName) => {
  fs.stat(
    path.resolve(`${process.env.imageStoragePath}/${imageName}`),
    (err, reject) => {
      if (err) {
        reject(err);
      }
      fs.unlink(
        path.resolve(`${process.env.imageStoragePath}/${imageName}`),
        (error) => {
          if (error) reject(error);
        }
      );
    }
  );
};

uploadFile.deleteFile = (req, res, next) =>
  new Promise((resolve, reject) => {
    try {
      if (req.body.imageNames) {
        for (let index = 0; index < req.body.imageNames.length; index += 1) {
          const element = req.body.imageNames[index];
          deleteSingleFile(element);
        }
      } else if (req.params.imageName) {
        deleteSingleFile(req.params.imageName);
      }
      resolve(next());
    } catch (error) {
      reject(error);
    }
  });

/*
 * for deleting the single file.
 */

/*
 * it sets the path of the files.
 */

uploadFile.setFilesStoragePath = (pathArray) => {
  filesStorgePath = pathArray;
  return filesStorgePath;
};
module.exports = uploadFile;
