const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const folders = ['uploads/avatars', 'uploads/portfolio', 'uploads/work_updates'];
folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
});

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest = 'uploads/';
        if (file.fieldname === 'avatar') dest += 'avatars/';
        else if (file.fieldname === 'portfolio_image') dest += 'portfolio/';
        else if (file.fieldname === 'work_image') dest += 'work_updates/';
        
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (JPEG, JPG, PNG, WEBP) are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

module.exports = upload;
