# 📹 Jorportube

> แพลตฟอร์มโฮสต์และสตรีมวิดีโอส่วนตัว พัฒนาด้วย Node.js + Express  
> อัปโหลด จัดเก็บ และสตรีมวิดีโอได้บนเซิร์ฟเวอร์ของตัวเอง ไม่พึ่งบริการภายนอก

---

## ✨ ฟีเจอร์

- 📤 **Video Upload** — อัปโหลดวิดีโอพร้อมกำหนดชื่อ ผ่านหน้าเว็บ
- 🎬 **HTTP Range Streaming** — สตรีมวิดีโอแบบ Partial Content (206) รองรับการ Seek ใน Player
- 🗂️ **JSON Metadata Store** — บันทึก title, filename, timestamp ลงใน `videos.json` อัตโนมัติ
- 🧹 **Auto Cleanup** — ตรวจสอบและลบ metadata ของไฟล์ที่หายไปออกจากรายการเมื่อ Server เริ่มทำงาน
- 🗑️ **Delete Video** — ลบไฟล์และ metadata พร้อมกันผ่าน REST API
- 🖥️ **Video Gallery** — แสดงวิดีโอทั้งหมดในรูปแบบ Grid พร้อม Player ในตัว
- 📋 **Server Logging** — บันทึก timestamp ทุก action (upload / stream / delete) ใน console

---

## 🏗️ Tech Stack

| Layer | เทคโนโลยี |
|-------|-----------|
| Runtime | Node.js |
| Web Framework | Express 5 |
| File Upload | Multer 2 |
| Storage | Local Filesystem (`/uploads`) |
| Metadata | JSON file (`videos.json`) |
| Frontend | HTML5 / CSS / Vanilla JavaScript |
| CI/CD | GitHub Actions |

---

## 📡 API Endpoints

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| `POST` | `/upload` | อัปโหลดวิดีโอ (multipart/form-data) |
| `GET` | `/videos` | ดึง metadata วิดีโอทั้งหมด |
| `GET` | `/video/:filename` | สตรีมไฟล์วิดีโอ (รองรับ HTTP Range) |
| `DELETE` | `/video/:id` | ลบวิดีโอและ metadata |

---

## 🚀 วิธีติดตั้งและรัน

### Prerequisites
- Node.js v16+

```bash
# 1. Clone repository
git clone https://github.com/dudeSwaper01441/Jorportube.git
cd Jorportube

# 2. ติดตั้ง dependencies
npm install

# 3. รัน server
node index.js

# 4. เปิดเบราว์เซอร์
# http://localhost:3000
```

---

## 📁 โครงสร้างไฟล์

```
Jorportube/
├── .github/workflows/    # CI/CD GitHub Actions
├── public/               # Static frontend (HTML, CSS, JS)
│   └── index.html
├── uploads/              # วิดีโอที่อัปโหลด (สร้างอัตโนมัติ)
├── index.js              # Express server + REST API
├── videos.json           # Metadata store
└── package.json
```

---

## 🔧 สถาปัตยกรรม

```
Browser
  │
  ├── POST /upload ──► Multer ──► /uploads/{timestamp}.mp4
  │                         └──► videos.json (append metadata)
  │
  ├── GET /videos ──────────────► videos.json (read all)
  │
  ├── GET /video/:filename ─────► ReadStream + HTTP 206 Range
  │
  └── DELETE /video/:id ────────► fs.unlink + videos.json (splice)
```

---

## 📄 License

Made with ❤️ by **knight wisdom**
