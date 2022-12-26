const multerObj = require('multer');
const fs = require('fs');
const path = require('path');

let filesStorgePath = [];

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
