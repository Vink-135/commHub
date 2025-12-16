const express = require("express");
const multer = require("multer");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

router.post("/", upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: false, msg: "No file uploaded" });
        }

        // Return relative path for client to access via static route
        // Assuming static route is /uploads
        const fileUrl = `/uploads/${req.file.filename}`;

        return res.json({
            status: true,
            fileUrl: fileUrl,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimetype: req.file.mimetype
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, msg: "Upload failed" });
    }
});

module.exports = router;
