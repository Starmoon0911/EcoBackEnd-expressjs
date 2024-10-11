const multer = require('multer');
const path = require('path');

// 設置 multer 存儲選項
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../upload/avatar')); // 設置上傳路徑
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`); // 設置文件名稱
    }
});

// 限制文件大小和文件類型
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 最大2MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        }

        // 傳遞錯誤消息，而不是拋出錯誤
        cb('只允許上傳 JPEG、PNG、GIF 或 WEBP 格式的圖片');
    }
});

// 將 multer 上傳的錯誤處理放在 Express 路由中
const uploadHandler = (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
        if (err) {
            // 檢查錯誤類型，並返回用戶友好的錯誤消息
            let message;
            if (err instanceof multer.MulterError) {
                // 例如文件大小錯誤
                message = '檔案大小超過限制，請上傳小於2MB的檔案。';
            } else {
                message = err; // 來自 fileFilter 的錯誤信息
            }
            return res.status(400).json({ message });
        }
        next();
    });
};

module.exports = uploadHandler;
