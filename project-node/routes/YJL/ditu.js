const express = require('express');
const cors = require('cors');

// 类型定义
/**
 * @typedef {Object} LocationData
 * @property {number} lng - 经度
 * @property {number} lat - 纬度
 * @property {number} [accuracy] - 精度
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - 是否成功
 * @property {string} message - 响应消息
 * @property {LocationData} [receivedData] - 接收到的数据
 */

// 存储位置历史 (实际应用中应该使用数据库)
const locationHistory = [];

// 位置API端点
const router = express.Router();

// 中间件 - 修复CORS配置
router.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
router.use(express.json());

// 接收位置信息
router.post('/location', (req, res) => {
  try {
    const location = req.body;
    
    // 验证数据
    if (typeof location.lng !== 'number' || typeof location.lat !== 'number') {
      return res.status(400).json({
        success: false,
        message: '无效的位置数据',
      });
    }
    
    // 添加时间戳
    const locationWithTimestamp = {
      ...location,
      timestamp: new Date().toISOString()
    };
    
    // 存储位置数据
    locationHistory.push(locationWithTimestamp);
    
    // 限制历史记录数量
    if (locationHistory.length > 100) {
      locationHistory.shift();
    }
    
    const response = {
      success: true,
      message: '位置信息已接收并存储',
      receivedData: location,
    };
    
    res.json(response);
  } catch (error) {
    console.error('处理位置数据时出错:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 获取位置历史
router.get('/location/history', (req, res) => {
  res.json({
    success: true,
    data: locationHistory,
    count: locationHistory.length,
  });
});

// 获取最新位置
router.get('/location/latest', (req, res) => {
  if (locationHistory.length === 0) {
    return res.json({
      success: false,
      message: '暂无位置记录',
    });
  }
  
  const latestLocation = locationHistory[locationHistory.length - 1];
  res.json({
    success: true,
    data: latestLocation,
  });
});

// 清除位置历史
router.delete('/location/history', (req, res) => {
  locationHistory.length = 0;
  res.json({
    success: true,
    message: '位置历史已清除',
  });
});

module.exports = router;
