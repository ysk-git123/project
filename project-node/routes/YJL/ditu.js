const express = require('express');
const cors = require('cors');
const axios = require('axios');

// 高德地图服务端API配置
const AMAP_CONFIG = {
  key: '284cf2c61352c1e151c799fb26765f1b', // Web服务Key
  baseUrl: 'https://restapi.amap.com/v3'
};

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

// 调试中间件
router.use((req, res, next) => {
  console.log(`[地图API] ${req.method} ${req.path}`);
  console.log('[地图API] Body:', req.body);
  next();
});

// 逆地理编码 - 根据坐标获取地址 (提前定义)
router.post('/reverse-geocode', async (req, res) => {
  console.log('=== 逆地理编码API被调用 ===');
  console.log('请求路径:', req.path);
  console.log('请求体:', req.body);
  
  try {
    const { lng, lat } = req.body;
    
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      console.log('坐标数据验证失败:', { lng, lat });
      return res.status(400).json({
        success: false,
        message: '无效的坐标数据',
      });
    }
    
    console.log('逆地理编码请求:', { lng, lat });
    
    // 调用高德地图逆地理编码API
    const response = await axios.get(`${AMAP_CONFIG.baseUrl}/geocode/regeo`, {
      params: {
        key: AMAP_CONFIG.key,
        location: `${lng},${lat}`,
        poitype: '',
        radius: 1000,
        extensions: 'base',
        batch: false,
        roadlevel: 0,
        output: 'json'
      },
      timeout: 10000
    });
    
    console.log('高德API响应:', response.data);
    
    if (response.data.status === '1' && response.data.regeocode) {
      const address = response.data.regeocode.formatted_address;
      const addressComponent = response.data.regeocode.addressComponent;
      
      res.json({
        success: true,
        data: {
          address: address,
          detail: {
            province: addressComponent.province,
            city: addressComponent.city,
            district: addressComponent.district,
            township: addressComponent.township,
            neighborhood: addressComponent.neighborhood,
            building: addressComponent.building,
            adcode: addressComponent.adcode,
            towncode: addressComponent.towncode
          }
        },
        message: '逆地理编码成功'
      });
    } else {
      // 使用离线地址解析作为备用
      const offlineAddress = getOfflineAddress({ lng, lat });
      res.json({
        success: true,
        data: {
          address: offlineAddress,
          detail: {
            province: '未知省份',
            city: '未知城市',
            district: '未知区域'
          }
        },
        message: '使用离线地址解析'
      });
    }
    
  } catch (error) {
    console.error('逆地理编码失败:', error.message);
    
    // 使用离线地址解析作为备用
    const { lng, lat } = req.body;
    const offlineAddress = getOfflineAddress({ lng, lat });
    
    res.json({
      success: true,
      data: {
        address: offlineAddress,
        detail: {
          province: '未知省份',
          city: '未知城市',
          district: '未知区域'
        }
      },
      message: '使用离线地址解析（API调用失败）'
    });
  }
});

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
    
    console.log('收到位置数据:', locationWithTimestamp);
    
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

// 地理编码 - 根据地址获取坐标
router.post('/geocode', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address || typeof address !== 'string') {
      return res.status(400).json({
        success: false,
        message: '无效的地址数据',
      });
    }
    
    console.log('地理编码请求:', address);
    
    // 调用高德地图地理编码API
    const response = await axios.get(`${AMAP_CONFIG.baseUrl}/geocode/geo`, {
      params: {
        key: AMAP_CONFIG.key,
        address: address,
        output: 'json'
      },
      timeout: 10000
    });
    
    console.log('高德地理编码API响应:', response.data);
    
    if (response.data.status === '1' && response.data.geocodes && response.data.geocodes.length > 0) {
      const geocode = response.data.geocodes[0];
      const [lng, lat] = geocode.location.split(',').map(Number);
      
      res.json({
        success: true,
        data: {
          lng: lng,
          lat: lat,
          level: geocode.level,
          adcode: geocode.adcode,
          city: geocode.city,
          district: geocode.district,
          province: geocode.province
        },
        message: '地理编码成功'
      });
    } else {
      res.json({
        success: false,
        message: '地址解析失败，请检查地址是否正确'
      });
    }
    
  } catch (error) {
    console.error('地理编码失败:', error.message);
    res.status(500).json({
      success: false,
      message: '地理编码服务暂时不可用'
    });
  }
});

// 离线地址解析函数
function getOfflineAddress(position) {
  const { lng, lat } = position;
  
  // 简化的离线地址解析（基于坐标范围）
  const cityRanges = [
    { name: '北京市', bounds: [115.7, 39.4, 117.4, 41.6] },
    { name: '上海市', bounds: [120.9, 30.7, 122.2, 31.9] },
    { name: '广州市', bounds: [112.9, 22.9, 114.5, 24.0] },
    { name: '深圳市', bounds: [113.7, 22.4, 114.8, 22.9] },
    { name: '杭州市', bounds: [119.7, 29.8, 120.9, 30.6] },
    { name: '南京市', bounds: [118.2, 31.1, 119.2, 32.8] }
  ];
  
  for (const city of cityRanges) {
    const [minLng, minLat, maxLng, maxLat] = city.bounds;
    if (lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat) {
      return `${city.name}附近`;
    }
  }
  
  // 基于省份范围的粗略判断
  if (lng >= 115.7 && lng <= 117.4 && lat >= 39.4 && lat <= 41.6) {
    return '北京市附近';
  } else if (lng >= 109.5 && lng <= 119.1 && lat >= 25.8 && lat <= 35.8) {
    return '华东地区';
  } else if (lng >= 104.1 && lng <= 126.0 && lat >= 33.3 && lat <= 47.0) {
    return '华北地区';
  } else if (lng >= 108.8 && lng <= 121.2 && lat >= 20.2 && lat <= 33.3) {
    return '华南地区';
  }
  
  return `坐标: ${lng.toFixed(4)}, ${lat.toFixed(4)}`;
}

module.exports = router;
