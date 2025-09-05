// index.js
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Store video metadata
let videos = [];

// Upload route
app.post("/upload", upload.single("video"), (req, res) => {
  const videoData = {
    id: Date.now(),
    title: req.body.title || req.file.originalname,
    filename: req.file.filename,
    timestamp: new Date().toISOString()  // 👈 add upload time
  };
  videos.push(videoData);
  res.json({ message: "Upload successful", video: videoData });
    let timestamp = Date.now();
    let dateObject = new Date(timestamp);
    console.log(`[${dateObject.toLocaleString()}]] Video uploaded: ${videoData.title}`);
});


// Get all videos metadata
app.get("/videos", (req, res) => {
    res.json(videos);
    let timestamp = Date.now();
    let dateObject = new Date(timestamp);
    console.log(`${dateObject.toLocaleString()} : Videos metadata requested`);
  
});

// Stream video
app.get("/video/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);
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

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
