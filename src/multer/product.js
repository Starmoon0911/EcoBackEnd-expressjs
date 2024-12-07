const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadDir = path.join(__dirname, '../../upload/product');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('建立了上傳目錄:', uploadDir);
}

// 設置 multer 存儲選項
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('設定圖片儲存目錄:', uploadDir);
        cb(null, uploadDir);  // 設置圖片儲存目錄
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `product-${uniqueSuffix}${path.extname(file.originalname)}`;
        console.log('設定圖片檔名:', filename);
        cb(null, filename); // 設置圖片的文件名稱
    }
});

// 限制文件大小和文件類型
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 最大5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
 
        if (mimetype && extname) {
            return cb(null, true);
        }

        cb('只允許上傳 JPEG、PNG、GIF 或 WEBP 格式的圖片');
    }
});

const ProductUploadHandler = (req, res, next) => {
    upload.array('images', 5)(req, res, (err) => {
        if (err) {
            let message;
            if (err instanceof multer.MulterError) {
                message = '檔案大小超過限制，請上傳小於5MB的檔案。';
            } else {
                message = err;
            }
            return res.status(400).json({ message });
        }

        // 在這裡處理路徑，確保反斜杠轉換為正斜杠
        req.files = req.files.map(file => ({
            ...file,
            path: path.join('/', path.relative(process.cwd(), file.path)).replace(/\\/g, '/')
        }));
        
        next();
    });
};


module.exports = ProductUploadHandler;
