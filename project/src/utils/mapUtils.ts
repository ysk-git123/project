// 地图工具函数文件 - 对接后端API
// 类型定义在使用的组件中定义，避免导入问题

// 后端API配置
export const MAP_API_CONFIG = {
  baseUrl: 'http://localhost:3000/YJL/api',
  endpoints: {
    location: '/location',
    locationHistory: '/location/history',
    locationLatest: '/location/latest',
    geocode: '/geocode', // 需要后端实现
    reverseGeocode: '/reverse-geocode' // 需要后端实现
  }
};

// 声明全局AMap类型（用于可能的前端地图显示）
declare global {
  interface Window {
    AMap: any;
  }
}

// 位置类型（仅供内部使用）
type Position = {
  lng: number;
  lat: number;
};

// API响应类型
type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  receivedData?: T;
};

// 发送位置到后端
export const sendLocationToBackend = async (position: Position): Promise<ApiResponse> => {
  try {
    console.log('发送位置到后端:', position);
    const response = await fetch(`${MAP_API_CONFIG.baseUrl}${MAP_API_CONFIG.endpoints.location}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(position)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('后端响应:', result);
    return result;
  } catch (error) {
    console.error('发送位置到后端失败:', error);
    throw error;
  }
};

// 从后端获取最新位置
export const getLatestLocationFromBackend = async (): Promise<Position | null> => {
  try {
    const response = await fetch(`${MAP_API_CONFIG.baseUrl}${MAP_API_CONFIG.endpoints.locationLatest}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return {
        lng: result.data.lng,
        lat: result.data.lat
      };
    }
    
    return null;
  } catch (error) {
    console.error('从后端获取最新位置失败:', error);
    return null;
  }
};

// 从后端获取位置历史
export const getLocationHistoryFromBackend = async (): Promise<Position[]> => {
  try {
    const response = await fetch(`${MAP_API_CONFIG.baseUrl}${MAP_API_CONFIG.endpoints.locationHistory}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data.map((item: any) => ({
        lng: item.lng,
        lat: item.lat
      }));
    }
    
    return [];
  } catch (error) {
    console.error('从后端获取位置历史失败:', error);
    return [];
  }
};

// 获取当前位置（使用浏览器定位+后端存储）
export const getCurrentPosition = (): Promise<Position> => {
  return new Promise((resolve, reject) => {
    console.log('开始获取当前位置...');

    // 首先尝试浏览器定位
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lng: position.coords.longitude,
            lat: position.coords.latitude
          };
          
          console.log('浏览器定位成功:', coords);
          
          // 将位置发送到后端存储
          try {
            await sendLocationToBackend(coords);
            console.log('位置已发送到后端存储');
          } catch (error) {
            console.warn('发送位置到后端失败，但定位成功:', error);
          }
          
          resolve(coords);
        },
        async (error) => {
          console.warn('浏览器定位失败:', error.message);
          
          // 尝试从后端获取最新位置作为后备
          try {
            const backendLocation = await getLatestLocationFromBackend();
            if (backendLocation) {
              console.log('使用后端最新位置:', backendLocation);
              resolve(backendLocation);
              return;
            }
          } catch (backendError) {
            console.warn('从后端获取位置也失败:', backendError);
          }
          
          // 最后使用默认坐标（北京天安门）
          console.log('使用默认坐标（北京天安门）');
          resolve({
            lng: 116.397428,
            lat: 39.90923
          });
        },
        options
      );
    } else {
      console.log('浏览器不支持定位，尝试从后端获取');
      
      // 尝试从后端获取最新位置
      getLatestLocationFromBackend()
        .then(backendLocation => {
          if (backendLocation) {
            console.log('使用后端最新位置:', backendLocation);
            resolve(backendLocation);
          } else {
            console.log('后端无位置记录，使用默认坐标');
            resolve({
              lng: 116.397428,
              lat: 39.90923
            });
          }
        })
        .catch(() => {
          console.log('后端获取失败，使用默认坐标');
          resolve({
            lng: 116.397428,
            lat: 39.90923
          });
        });
    }
  });
};

// 简化的高德地图API加载（仅用于前端地图显示）
export const loadAMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载
    if (window.AMap) {
      console.log('高德地图API已存在');
      resolve();
      return;
    }

    // 检查是否正在加载
    if (document.querySelector(`script[src*="webapi.amap.com"]`)) {
      const checkLoaded = () => {
        if (window.AMap) {
          console.log('等待中的高德地图API加载完成');
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // 使用最简单的高德地图Key（仅用于前端地图显示）
    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=1.4.15&key=284cf2c61352c1e151c799fb26765f1b`;
    script.async = true;
    
    script.onload = () => {
      console.log('高德地图API加载成功（仅用于前端显示）');
      resolve();
    };
    
    script.onerror = () => {
      console.warn('高德地图API加载失败（不影响功能，使用后端API）');
      resolve(); // 即使失败也resolve，因为主要功能依赖后端
    };
    
    document.head.appendChild(script);
  });
};

// 逆地理编码 - 调用后端API
export const reverseGeocode = async (position: Position): Promise<string> => {
  try {
    console.log('调用后端逆地理编码API:', position);
    
    const response = await fetch(`${MAP_API_CONFIG.baseUrl}${MAP_API_CONFIG.endpoints.reverseGeocode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(position)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('后端逆地理编码响应:', result);
    
    if (result.success && result.data && result.data.address) {
      return result.data.address;
    } else {
      // 如果后端API失败，使用离线解析
      console.log('后端API返回失败，使用离线解析');
      return getOfflineAddress(position);
    }
    
  } catch (error) {
    console.error('后端逆地理编码失败，使用离线解析:', error);
    return getOfflineAddress(position);
  }
};

// 离线地址解析（根据坐标范围推测大概位置）
function getOfflineAddress(position: Position): string {
  const { lng, lat } = position;
  
  // 更精确的中国主要城市坐标范围和区域划分
  const cityRanges = [
    // 北京市各区
    { name: '北京市海淀区', lngRange: [116.0, 116.4], latRange: [39.8, 40.2] },
    { name: '北京市朝阳区', lngRange: [116.4, 116.8], latRange: [39.8, 40.1] },
    { name: '北京市东城区', lngRange: [116.35, 116.45], latRange: [39.85, 39.95] },
    { name: '北京市西城区', lngRange: [116.3, 116.4], latRange: [39.85, 39.95] },
    { name: '北京市丰台区', lngRange: [116.1, 116.5], latRange: [39.7, 39.9] },
    { name: '北京市石景山区', lngRange: [116.1, 116.3], latRange: [39.85, 39.95] },
    { name: '北京市', lngRange: [115.7, 117.4], latRange: [39.4, 41.6] },
    
    // 上海市各区
    { name: '上海市浦东新区', lngRange: [121.5, 122.0], latRange: [30.9, 31.5] },
    { name: '上海市黄浦区', lngRange: [121.45, 121.52], latRange: [31.22, 31.25] },
    { name: '上海市徐汇区', lngRange: [121.4, 121.48], latRange: [31.15, 31.22] },
    { name: '上海市长宁区', lngRange: [121.38, 121.45], latRange: [31.2, 31.26] },
    { name: '上海市静安区', lngRange: [121.44, 121.48], latRange: [31.22, 31.26] },
    { name: '上海市普陀区', lngRange: [121.35, 121.45], latRange: [31.22, 31.28] },
    { name: '上海市', lngRange: [120.9, 122.0], latRange: [30.7, 31.9] },
    
    // 广州市各区
    { name: '广州市天河区', lngRange: [113.3, 113.4], latRange: [23.1, 23.2] },
    { name: '广州市越秀区', lngRange: [113.25, 113.3], latRange: [23.12, 23.15] },
    { name: '广州市海珠区', lngRange: [113.25, 113.35], latRange: [23.05, 23.12] },
    { name: '广州市荔湾区', lngRange: [113.2, 113.28], latRange: [23.1, 23.15] },
    { name: '广州市白云区', lngRange: [113.2, 113.4], latRange: [23.15, 23.35] },
    { name: '广州市', lngRange: [113.1, 113.8], latRange: [22.8, 23.8] },
    
    // 深圳市各区
    { name: '深圳市福田区', lngRange: [114.0, 114.1], latRange: [22.5, 22.6] },
    { name: '深圳市南山区', lngRange: [113.9, 114.0], latRange: [22.5, 22.6] },
    { name: '深圳市宝安区', lngRange: [113.8, 113.95], latRange: [22.5, 22.8] },
    { name: '深圳市龙岗区', lngRange: [114.1, 114.4], latRange: [22.6, 22.8] },
    { name: '深圳市', lngRange: [113.7, 114.6], latRange: [22.4, 22.9] },
    
    // 其他主要城市
    { name: '杭州市西湖区', lngRange: [120.1, 120.2], latRange: [30.2, 30.3] },
    { name: '杭州市', lngRange: [119.5, 120.9], latRange: [29.8, 30.9] },
    { name: '南京市', lngRange: [118.4, 119.2], latRange: [31.8, 32.6] },
    { name: '武汉市', lngRange: [113.7, 115.0], latRange: [30.1, 31.4] },
    { name: '成都市', lngRange: [103.6, 104.9], latRange: [30.1, 31.4] },
    { name: '西安市', lngRange: [108.6, 109.8], latRange: [34.0, 34.8] },
    { name: '重庆市', lngRange: [105.8, 110.2], latRange: [28.1, 32.2] },
    { name: '天津市', lngRange: [116.8, 118.0], latRange: [38.5, 40.3] },
    { name: '苏州市', lngRange: [119.8, 121.5], latRange: [30.8, 32.0] },
    { name: '郑州市', lngRange: [113.0, 114.5], latRange: [34.4, 35.0] },
    { name: '长沙市', lngRange: [112.5, 113.5], latRange: [27.8, 28.5] },
    { name: '沈阳市', lngRange: [123.0, 124.0], latRange: [41.5, 42.0] },
    { name: '青岛市', lngRange: [119.8, 121.0], latRange: [35.8, 36.5] },
    { name: '大连市', lngRange: [121.2, 122.0], latRange: [38.8, 39.2] },
    { name: '厦门市', lngRange: [118.0, 118.2], latRange: [24.4, 24.6] },
    { name: '宁波市', lngRange: [121.3, 121.8], latRange: [29.7, 30.0] },
    { name: '无锡市', lngRange: [120.0, 120.5], latRange: [31.4, 31.7] },
    { name: '佛山市', lngRange: [112.8, 113.5], latRange: [22.8, 23.2] },
    { name: '东莞市', lngRange: [113.6, 114.2], latRange: [22.9, 23.3] }
  ];
  
  // 查找匹配的城市（按精确度排序，先匹配区级）
  for (const city of cityRanges) {
    if (lng >= city.lngRange[0] && lng <= city.lngRange[1] && 
        lat >= city.latRange[0] && lat <= city.latRange[1]) {
      return `${city.name} 附近 (${lng.toFixed(4)}, ${lat.toFixed(4)})`;
    }
  }
  
  // 省级范围判断
  const provinceRanges = [
    { name: '河北省', lngRange: [113.5, 119.8], latRange: [36.0, 42.6] },
    { name: '山西省', lngRange: [110.2, 114.6], latRange: [34.6, 40.7] },
    { name: '内蒙古自治区', lngRange: [97.2, 126.0], latRange: [37.4, 53.3] },
    { name: '辽宁省', lngRange: [118.9, 125.4], latRange: [38.7, 43.4] },
    { name: '吉林省', lngRange: [121.4, 131.2], latRange: [40.9, 46.3] },
    { name: '黑龙江省', lngRange: [121.2, 135.1], latRange: [43.4, 53.6] },
    { name: '江苏省', lngRange: [116.4, 121.9], latRange: [30.8, 35.1] },
    { name: '浙江省', lngRange: [118.0, 123.0], latRange: [27.0, 31.4] },
    { name: '安徽省', lngRange: [114.9, 119.3], latRange: [29.4, 34.7] },
    { name: '福建省', lngRange: [115.8, 120.4], latRange: [23.5, 28.3] },
    { name: '江西省', lngRange: [113.6, 118.5], latRange: [24.5, 30.0] },
    { name: '山东省', lngRange: [114.8, 122.7], latRange: [34.4, 38.4] },
    { name: '河南省', lngRange: [110.4, 116.6], latRange: [31.4, 36.4] },
    { name: '湖北省', lngRange: [108.3, 116.1], latRange: [29.0, 33.3] },
    { name: '湖南省', lngRange: [108.8, 114.2], latRange: [24.6, 30.1] },
    { name: '广东省', lngRange: [109.8, 117.3], latRange: [20.2, 25.5] },
    { name: '广西壮族自治区', lngRange: [104.4, 112.0], latRange: [20.9, 26.4] },
    { name: '海南省', lngRange: [108.6, 111.0], latRange: [18.1, 20.1] },
    { name: '四川省', lngRange: [97.4, 108.5], latRange: [26.0, 34.3] },
    { name: '贵州省', lngRange: [103.6, 109.6], latRange: [24.6, 29.2] },
    { name: '云南省', lngRange: [97.5, 106.2], latRange: [21.1, 29.2] },
    { name: '陕西省', lngRange: [105.5, 111.2], latRange: [31.4, 39.6] },
    { name: '甘肃省', lngRange: [92.1, 108.7], latRange: [32.1, 42.6] },
    { name: '青海省', lngRange: [89.4, 103.0], latRange: [31.6, 39.2] },
    { name: '宁夏回族自治区', lngRange: [104.2, 107.6], latRange: [35.2, 39.4] },
    { name: '新疆维吾尔自治区', lngRange: [73.4, 96.4], latRange: [34.3, 49.2] },
    { name: '西藏自治区', lngRange: [78.2, 99.1], latRange: [26.8, 36.5] }
  ];
  
  // 查找匹配的省份
  for (const province of provinceRanges) {
    if (lng >= province.lngRange[0] && lng <= province.lngRange[1] && 
        lat >= province.latRange[0] && lat <= province.latRange[1]) {
      return `${province.name} 境内位置 (${lng.toFixed(4)}, ${lat.toFixed(4)})`;
    }
  }
  
  // 根据坐标范围判断大概区域
  if (lng >= 73 && lng <= 135 && lat >= 18 && lat <= 54) {
    return `中国境内位置 (${lng.toFixed(4)}, ${lat.toFixed(4)})`;
  } else {
    return `位置坐标: ${lng.toFixed(6)}, ${lat.toFixed(6)}`;
  }
}

// 地理编码 - 调用后端API
export const geocode = async (address: string): Promise<Position | null> => {
  try {
    console.log('调用后端地理编码API:', address);
    
    const response = await fetch(`${MAP_API_CONFIG.baseUrl}${MAP_API_CONFIG.endpoints.geocode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('后端地理编码响应:', result);
    
    if (result.success && result.data) {
      return {
        lng: result.data.lng,
        lat: result.data.lat
      };
    }
    
    return null;
    
  } catch (error) {
    console.error('后端地理编码失败:', error);
    return null;
  }
};

// 搜索地点
export const searchPlace = (keyword: string, city = "全国"): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    if (!window.AMap) {
      reject(new Error('高德地图API未加载'));
      return;
    }

    window.AMap.plugin("AMap.PlaceSearch", () => {
      const placeSearch = new window.AMap.PlaceSearch({
        city: city,
        pageSize: 10,
        pageIndex: 1,
      });

      placeSearch.search(keyword, (status: string, result: any) => {
        if (status === "complete" && result.poiList && result.poiList.pois.length > 0) {
          resolve(result.poiList.pois);
        } else {
          reject(new Error('搜索失败'));
        }
      });
    });
  });
};

// 自动完成搜索
export const autoComplete = (keyword: string, city = "全国"): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    if (!window.AMap) {
      reject(new Error('高德地图API未加载'));
      return;
    }

    window.AMap.plugin("AMap.AutoComplete", () => {
      const autoComplete = new window.AMap.AutoComplete({ city: city });

      autoComplete.search(keyword, (status: string, result: any) => {
        if (status === "complete" && result.tips && result.tips.length > 0) {
          resolve(result.tips);
        } else {
          resolve([]);
        }
      });
    });
  });
};

// 计算两点之间的距离
export const calculateDistance = (pos1: Position, pos2: Position): number => {
  if (!window.AMap) {
    throw new Error('高德地图API未加载');
  }
  
  const point1 = new window.AMap.LngLat(pos1.lng, pos1.lat);
  const point2 = new window.AMap.LngLat(pos2.lng, pos2.lat);
  return point1.distance(point2);
};

// 格式化距离显示
export const formatDistance = (distance: number): string => {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
};

// 错误处理
export const handleMapError = (error: Error): string => {
  console.error('地图错误:', error);
  
  if (error.message.includes('定位')) {
    return '定位服务不可用，请检查设备GPS设置';
  } else if (error.message.includes('网络')) {
    return '网络连接失败，请检查网络设置';
  } else if (error.message.includes('API')) {
    return '地图服务暂时不可用';
  } else {
    return error.message || '未知错误';
  }
};

// 地址格式化
export const formatAddress = (address: string): string => {
  // 移除重复的省市信息
  return address
    .replace(/(.+省)\1/, '$1')
    .replace(/(.+市)\1/, '$1')
    .replace(/(.+区)\1/, '$1')
    .replace(/(.+县)\1/, '$1');
};

// 常用城市坐标
export const CITY_COORDINATES = {
  '北京': { lng: 116.397428, lat: 39.90923 },
  '上海': { lng: 121.473701, lat: 31.230416 },
  '广州': { lng: 113.264434, lat: 23.129162 },
  '深圳': { lng: 114.085947, lat: 22.547 },
  '杭州': { lng: 120.153576, lat: 30.287459 },
  '南京': { lng: 118.767413, lat: 32.041544 },
  '武汉': { lng: 114.298572, lat: 30.584355 },
  '成都': { lng: 104.065735, lat: 30.659462 },
  '西安': { lng: 108.948024, lat: 34.263161 },
  '重庆': { lng: 106.504962, lat: 29.533155 }
};

// 获取城市坐标
export const getCityCoordinates = (cityName: string): Position | null => {
  const city = Object.keys(CITY_COORDINATES).find(key => 
    key.includes(cityName) || cityName.includes(key)
  );
  return city ? CITY_COORDINATES[city as keyof typeof CITY_COORDINATES] : null;
}; 