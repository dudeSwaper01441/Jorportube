// index.js
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const UPLOAD_DIR = path.join(__dirname, "uploads");
const DATA_FILE = path.join(__dirname, "videos.json");

// Ensure uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Load existing metadata
let videos = [];
if (fs.existsSync(DATA_FILE)) {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    videos = JSON.parse(data);
  } catch (err) {
    console.error("Error reading videos.json:", err);
    videos = [];
  }
}

// Clean up missing files from metadata
videos = videos.filter(v => {
  const filePath = path.join(UPLOAD_DIR, v.filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`Missing file, removed from list: ${v.filename}`);
    return false;
  }
  return true;
});

// Save helper
function saveVideos() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(videos, null, 2));
    console.log("videos.json saved");
  } catch (err) {
    console.error("Error saving videos.json:", err);
  }
}
saveVideos(); // save cleaned list

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Upload route
app.post("/upload", upload.single("video"), (req, res) => {
  const videoData = {
    id: Date.now(),
    title: req.body.title || req.file.originalname,
    filename: req.file.filename,
    timestamp: new Date().toISOString()
  };

  videos.push(videoData);
  saveVideos();

  const dateObject = new Date();
  console.log(`[${dateObject.toLocaleString()}] ✅ Uploaded: ${videoData.title}`);

  res.json({ message: "Upload successful", video: videoData });
});

// Get all videos metadata
app.get("/videos", (req, res) => {
  res.json(videos);
  const dateObject = new Date();
  console.log(`[${dateObject.toLocaleString()}] 📂 Metadata requested`);
});

// Stream video
app.get("/video/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Delete video
app.delete("/video/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const videoIndex = videos.findIndex(v => v.id === id);

  if (videoIndex === -1) {
    return res.status(404).json({ message: "Video not found" });
  }

  const video = videos[videoIndex];
  const filePath = path.join(UPLOAD_DIR, video.filename);

  fs.unlink(filePath, err => {
    if (err) {
      console.error("Error deleting file:", err);
      return res.status(500).json({ message: "Error deleting file" });
    }

    videos.splice(videoIndex, 1);
    saveVideos();

    const dateObject = new Date();
    console.log(`[${dateObject.toLocaleString()}] 🗑️ Deleted: ${video.title}`);

    res.json({ message: "Video deleted successfully" });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
// index.js