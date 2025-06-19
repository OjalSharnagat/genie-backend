const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  title: { type: String, required: false },
  file: { type: String, required: true },
});

module.exports = mongoose.model('File', FileSchema);
