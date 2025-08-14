const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const verifyAccessToken = require('../../middlewarelzy/verifyAccessToken');

// 调试：检查中间件是否正确加载
console.log('🔍 verifyAccessToken 中间件加载状态:', {
  isFunction: typeof verifyAccessToken === 'function',
  isDefined: verifyAccessToken !== undefined,
  path: require.resolve('../../middlewarelzy/verifyAccessToken')
});

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../public/uploads');
const productsDir = path.join(uploadDir, 'products');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 根据文件类型决定存储目录
    if (file.fieldname === 'file') {
      cb(null, productsDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名：时间戳 + 随机数 + 原扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 只允许图片文件
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件！'), false);
  }
};

// 创建multer实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 限制2MB
    files: 1 // 限制一次只能上传1个文件
  }
});

// 商品图片上传接口
router.post('/product', verifyAccessToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '没有选择文件'
      });
    }

    // 构建文件访问URL
    const fileUrl = `/uploads/products/${req.file.filename}`;
    
    res.json({
      success: true,
      message: '图片上传成功',
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('图片上传失败:', error);
    res.status(500).json({
      success: false,
      message: '图片上传失败',
      error: error.message
    });
  }
});

// 通用图片上传接口
router.post('/image', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '没有选择文件'
      });
    }

    // 构建文件访问URL
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: '图片上传成功',
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('图片上传失败:', error);
    res.status(500).json({
      success: false,
      message: '图片上传失败',
      error: error.message
    });
  }
});

// 删除图片接口
router.delete('/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const { type = 'general' } = req.query;
    
    let filePath;
    if (type === 'product') {
      filePath = path.join(productsDir, filename);
    } else {
      filePath = path.join(uploadDir, filename);
    }
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }
    
    // 删除文件
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: '文件删除成功'
    });
  } catch (error) {
    console.error('文件删除失败:', error);
    res.status(500).json({
      success: false,
      message: '文件删除失败',
      error: error.message
    });
  }
});

// 获取上传目录信息
router.get('/info', (req, res) => {
  try {
    const stats = {
      uploadDir: uploadDir,
      productsDir: productsDir,
      exists: {
        uploadDir: fs.existsSync(uploadDir),
        productsDir: fs.existsSync(productsDir)
      }
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取目录信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取目录信息失败',
      error: error.message
    });
  }
});

module.exports = router; 