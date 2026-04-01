const multer = require("multer");

const storage = multer.memoryStorage(); // guardamos en memoria antes de subir a Supabase

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["application/pdf", "image/jpeg"]; 
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Solo se permiten archivos pdf o jpg"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    }
});

module.exports = upload;