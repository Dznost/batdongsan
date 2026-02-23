const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {

    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh (JPEG, JPG, PNG, GIF)'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
        files: 5 // Maximum 5 files
    },
    fileFilter: fileFilter
});

const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            req.flash('error', 'File quá lớn. Kích thước tối đa là 5MB');
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            req.flash('error', 'Chỉ được upload tối đa 5 ảnh');
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            req.flash('error', 'Trường file không hợp lệ');
        } else {
            req.flash('error', 'Lỗi upload file: ' + err.message);
        }
        return res.redirect('back');
    } else if (err) {
        req.flash('error', err.message);
        return res.redirect('back');
    }
    next();
};

const uploadPostImages = [
    upload.array('images', 5),
    handleUploadError
];

const uploadSingleImage = [
    upload.single('image'),
    handleUploadError
];

const deleteFile = async (filePath) => {
    try {
        const fullPath = path.join(__dirname, '../public', filePath);
        await fs.promises.unlink(fullPath);
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};

const validateImage = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
        return { valid: false, error: 'Định dạng file không hợp lệ' };
    }

    if (file.size > maxSize) {
        return { valid: false, error: 'File quá lớn (tối đa 5MB)' };
    }

    return { valid: true };
};

const processImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next();
    }

    try {

        for (const file of req.files) {
            const validation = validateImage(file);
            if (!validation.valid) {

                await deleteFile(`/uploads/${file.filename}`);
                req.flash('error', validation.error);
                return res.redirect('back');
            }
        }

        next();
    } catch (error) {
        console.error('Error processing images:', error);
        req.flash('error', 'Có lỗi xảy ra khi xử lý ảnh');
        res.redirect('back');
    }
};

module.exports = {
    upload,
    uploadPostImages,
    uploadSingleImage,
    handleUploadError,
    deleteFile,
    validateImage,
    processImages
};
