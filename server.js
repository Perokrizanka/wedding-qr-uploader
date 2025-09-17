// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = Date.now() + '-' + Math.random().toString(36).slice(2,8) + ext;
    cb(null, name);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Samo slike so dovoljene!'));
    cb(null, true);
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOAD_DIR));

app.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: 'Ni datoteke' });
  res.json({ ok: true, filename: req.file.filename, url: `/uploads/${req.file.filename}` });
});

app.get('/list-images', (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) return res.status(500).json({ ok: false, message: err.message });
    const imgs = files.filter(f => /\.(jpe?g|png|gif|webp|heic?)$/i.test(f)).map(f => `/uploads/${f}`);
    res.json({ ok: true, images: imgs });
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
