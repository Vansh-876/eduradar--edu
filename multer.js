const multer = require('multer');
const { storage } = require('./cloudConfig');

const upload = multer({ storage });

module.exports = upload;

