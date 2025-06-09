const cloudinary = require('cloudinary').v2;
const config = require('./index');

cloudinary.config({
  cloud_name: config.CLOUDINARY.CLOUD_NAME,
  api_key: config.CLOUDINARY.API_KEY,
  api_secret: config.CLOUDINARY.API_SECRET,
  secure: true,
});

module.exports = cloudinary;