const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const File = require('./models/File');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// 🛠️ Ensure 'uploads' directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// ✅ Serve static files
app.use('/uploads', express.static('uploads'));

// ✅ Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });
// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// ✅ Upload route
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log("📥 Request Body:", req.body);
    console.log("📎 Uploaded File:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    const newFile = new File({
      title: req.body.title,
      file: req.file.filename,
    });

    await newFile.save();

    res.json({ message: 'File uploaded!' });
  } catch (error) {
    console.error("❌ Upload Error:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});


// ✅ Get all files route
app.get('/files', async (req, res) => {
  try {
    const files = await File.find();
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching files', error: err.message });
  }
});

// ✅ Start server
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
