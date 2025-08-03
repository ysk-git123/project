import React, { useState, useEffect, useRef } from 'react';
import './AddressSelector.css';

// 简化类型定义
interface LocationData {
  lng: number;
  lat: number;
  accuracy?: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  receivedData?: LocationData;
}

interface Address {
  id?: string;
  recipient: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
}

interface AddressSelectorProps {
  currentAddress?: Address;
  onAddressSelect: (address: Address) => void;
  onClose: () => void;
}

// 高德地图Key - 统一配置
const AMAP_KEY = '284cf2c61352c1e151c799fb26765f1b';

declare global {
  interface Window {
    AMap: any;
    closeAMapSelector?: () => void;
  }
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  currentAddress,
  onAddressSelect,
  onClose
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Address>({
    recipient: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  
  // 使用useRef管理地图实例
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  // 加载高德地图JS API
  useEffect(() => {
    if (window.AMap) {
      setMapLoaded(true);
      initGeocoder();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Geocoder,AMap.Geolocation`;
    script.async = true;
    script.onload = () => {
      setMapLoaded(true);
      initGeocoder();
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // 初始化地理编码器
  const initGeocoder = () => {
    if (window.AMap) {
      geocoderRef.current = new window.AMap.Geocoder();
    }
  };

  // 模拟地址数据
  useEffect(() => {
    const mockAddresses: Address[] = [
      {
        id: '1',
        recipient: '张小五',
        phone: '13945678912',
        province: '北京市',
        city: '北京市',
        district: '昌平区',
        detail: '回龙观大街小区31号',
        isDefault: true,
        latitude: 40.073,
        longitude: 116.34
      },
      {
        id: '2',
        recipient: '李小明',
        phone: '13812345678',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '三里屯SOHO 2号楼 1501',
        isDefault: false,
        latitude: 39.937,
        longitude: 116.447
      }
    ];
    setAddresses(mockAddresses);
  }, []);

  // 获取用户当前位置
  const getCurrentLocation = async () => {
    if (!mapLoaded || !window.AMap) {
      alert('地图服务加载中，请稍候');
      return;
    }

    setLoading(true);
    setApiResponse(null);

    try {
      // 首先尝试浏览器原生定位作为备用方案
      const nativeResult = await getNativeLocation();
      if (nativeResult.success && nativeResult.position) {
        console.log('使用浏览器原生定位成功');
        const locationData = {
          lng: nativeResult.position.lng,
          lat: nativeResult.position.lat,
          accuracy: nativeResult.accuracy
        };

        // 发送位置到服务器
        const response = await sendLocationToServer(locationData);
        setApiResponse(response);

        // 逆地理编码获取地址信息
        reverseGeocode(nativeResult.position.lat, nativeResult.position.lng);
        return;
      }

      // 如果原生定位失败，尝试高德地图API
      console.log('尝试使用高德地图API定位');
      const result = await getAMapLocation();
      
      if (result.success && result.position) {
        const locationData = {
          lng: result.position.lng,
          lat: result.position.lat,
          accuracy: result.accuracy
        };

        // 发送位置到服务器
        const response = await sendLocationToServer(locationData);
        setApiResponse(response);

        // 逆地理编码获取地址信息
        reverseGeocode(result.position.lat, result.position.lng);
      } else {
        alert('获取位置失败: ' + (result.message || '未知错误'));
      }
    } catch (err) {
      alert('定位服务异常: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  // 浏览器原生定位
  const getNativeLocation = (): Promise<{
    success: boolean;
    position?: { lng: number; lat: number };
    accuracy?: number;
    message?: string;
  }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          success: false,
          message: '浏览器不支持地理定位'
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            success: true,
            position: {
              lng: position.coords.longitude,
              lat: position.coords.latitude,
            },
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          let message = '定位失败';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = '用户拒绝了定位请求';
              break;
            case error.POSITION_UNAVAILABLE:
              message = '位置信息不可用';
              break;
            case error.TIMEOUT:
              message = '定位请求超时';
              break;
            default:
              message = error.message || '定位失败';
          }
          resolve({
            success: false,
            message
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    });
  };

  // 使用高德API获取位置
  const getAMapLocation = (): Promise<{
    success: boolean;
    position?: { lng: number; lat: number };
    accuracy?: number;
    message?: string;
  }> => {
    return new Promise((resolve) => {
      if (!window.AMap) {
        resolve({
          success: false,
          message: '地图服务未加载'
        });
        return;
      }

      const geolocation = new window.AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 15000,
        showButton: false,
        zoomToAccuracy: true,
        GeoLocationFirst: true,
      });

      geolocation.getCurrentPosition((status: string, result: any) => {
        if (status === 'complete') {
          resolve({
            success: true,
            position: {
              lng: result.position.getLng(),
              lat: result.position.getLat(),
            },
            accuracy: result.accuracy,
          });
        } else {
          resolve({
            success: false,
            message: result.message || '定位失败',
          });
        }
      });
    });
  };

  // 发送位置到后端
  const sendLocationToServer = async (location: LocationData): Promise<ApiResponse> => {
    try {
      const response = await fetch('http://localhost:3001/YJL/api/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(location),
      });
      return await response.json();
    } catch {
      throw new Error('发送位置到服务器失败');
    }
  };

  // 逆地理编码（经纬度转地址）
  const reverseGeocode = (latitude: number, longitude: number) => {
    if (geocoderRef.current) {
      geocoderRef.current.getAddress([longitude, latitude], (status: string, result: any) => {
        if (status === 'complete' && result.regeocode) {
          const addressComponent = result.regeocode.addressComponent;
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude,
            province: addressComponent.province || '',
            city: addressComponent.city || addressComponent.province || '',
            district: addressComponent.district || '',
            detail: result.regeocode.formattedAddress.split(addressComponent.province)
              .join('')
              .split(addressComponent.city)
              .join('')
              .split(addressComponent.district)
              .join('')
              .trim()
          }));
        } else {
          alert('获取地址信息失败');
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude
          }));
        }
      });
    }
  };

  // 打开地图选择位置
  const openMapSelector = () => {
    if (!mapLoaded || !window.AMap || !mapRef.current) {
      alert('地图服务加载中，请稍候');
      return;
    }

    // 创建地图实例
    const map = new window.AMap.Map(mapRef.current, {
      zoom: 15,
      viewMode: '2D',
      canvasOptions: {
        willReadFrequently: true
      }
    });

    // 保存地图实例到ref
    mapInstanceRef.current = map;

    // 添加地图点击事件
    const clickHandler = (e: any) => {
      const { lng, lat } = e.lnglat;
      reverseGeocode(lat, lng);
      map.destroy();
      mapInstanceRef.current = null;
      if (mapRef.current) {
        mapRef.current.style.display = 'none';
      }
    };

    map.on('click', clickHandler);

    // 显示地图容器
    if (mapRef.current) {
      mapRef.current.style.display = 'block';
      mapRef.current.style.width = '100%';
      mapRef.current.style.height = '400px';
    }

    // 添加定位控件
    window.AMap.plugin(['AMap.Geolocation'], () => {
      const geolocation = new window.AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 15000,
        buttonPosition: 'RB',
        zoomToAccuracy: true,
        GeoLocationFirst: true
      });
      map.addControl(geolocation);
      geolocation.getCurrentPosition(() => {
        // 定位完成后的回调
      });
    });

    // 添加点击关闭地图的功能
    const closeMap = () => {
      map.off('click', clickHandler);
      map.destroy();
      mapInstanceRef.current = null;
      if (mapRef.current) {
        mapRef.current.style.display = 'none';
      }
    };

    // 保存关闭函数以便后续使用
    window.closeAMapSelector = closeMap;
  };

  const handleInputChange = (field: keyof Address, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.recipient || !formData.phone || !formData.detail) {
      alert('请填写完整的地址信息');
      return;
    }

    const newAddress: Address = {
      ...formData,
      id: Date.now().toString()
    };

    setAddresses(prev => [...prev, newAddress]);
    onAddressSelect(newAddress);
    setShowAddForm(false);
    onClose();
  };

  const selectAddress = (address: Address) => {
    onAddressSelect(address);
    onClose();
  };

  return (
    <div className="address-selector-overlay">
      <div className="address-selector">
        <div className="address-header">
          <h3>选择收货地址</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {!showAddForm ? (
          <>
            <div className="address-list">
              {addresses.map(address => (
                <div
                  key={address.id}
                  className={`address-item ${currentAddress?.id === address.id ? 'selected' : ''}`}
                  onClick={() => selectAddress(address)}
                >
                  <div className="address-info">
                    <div className="recipient-info">
                      <span className="name">{address.recipient}</span>
                      <span className="phone">{address.phone}</span>
                      {address.isDefault && <span className="default-tag">默认</span>}
                    </div>
                    <div className="address-detail">
                      {address.province} {address.city} {address.district} {address.detail}
                    </div>
                  </div>
                  <div className="address-actions">
                    <button className="edit-btn">编辑</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="add-address-section">
              <button
                className="add-address-btn"
                onClick={() => setShowAddForm(true)}
              >
                + 添加新地址
              </button>
            </div>
          </>
        ) : (
          <div className="add-address-form">
            <div className="form-group">
              <label>收货人</label>
              <input
                type="text"
                value={formData.recipient}
                onChange={(e) => handleInputChange('recipient', e.target.value)}
                placeholder="请输入收货人姓名"
              />
            </div>

            <div className="form-group">
              <label>手机号</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="请输入手机号码"
              />
            </div>

            <div className="location-section">
              <div className="location-buttons">
                <button 
                  className="location-btn" 
                  onClick={getCurrentLocation}
                  disabled={loading}
                >
                  {loading ? '📍 定位中...' : '📍 获取当前位置'}
                </button>
                <button className="map-btn" onClick={openMapSelector}>
                  🗺️ 地图选择
                </button>
              </div>
              <div ref={mapRef} style={{ display: 'none', marginTop: '10px' }}></div>
              
              {apiResponse && (
                <div className="api-response">
                  <p>服务器响应: {apiResponse.message}</p>
                  {apiResponse.receivedData && (
                    <p>位置: {apiResponse.receivedData.lng.toFixed(6)}, {apiResponse.receivedData.lat.toFixed(6)}</p>
                  )}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>省/市</label>
                <input
                  type="text"
                  value={formData.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                  placeholder="省份"
                />
              </div>
              <div className="form-group">
                <label>城市</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="城市"
                />
              </div>
              <div className="form-group">
                <label>区/县</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  placeholder="区县"
                />
              </div>
            </div>

            <div className="form-group">
              <label>详细地址</label>
              <input
                type="text"
                value={formData.detail}
                onChange={(e) => handleInputChange('detail', e.target.value)}
                placeholder="街道、门牌号等详细信息"
              />
            </div>

            <div className="form-actions">
              <button className="cancel-btn" onClick={() => setShowAddForm(false)}>
                取消
              </button>
              <button className="save-btn" onClick={handleSubmit}>
                保存地址
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressSelector; 