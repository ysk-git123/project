import React, { useState, useEffect, useRef } from 'react';
import './modules.css/AddressSelector.moudel.css';
import { loadAMapScript, getCurrentPosition, reverseGeocode } from '../../utils/mapUtils';

// // 直接在这里定义Position类型，避免导入问题
// interface Position {
//   lng: number;
//   lat: number;
// }

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
  const [mapError, setMapError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  
  // 使用useRef管理地图实例
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  // 加载高德地图JS API
  useEffect(() => {
    loadAMapScript()
      .then(() => {
        setMapLoaded(true);
        setMapError(null);
        // 延迟初始化，确保AMap完全加载
        setTimeout(() => {
          initGeocoder();
        }, 100);
      })
      .catch(error => {
        console.error('地图加载失败:', error);
        setMapLoaded(false);
        setMapError('地图加载失败');
      });
  }, []);

  // 初始化地理编码器
  const initGeocoder = () => {
    if (window.AMap && window.AMap.Geocoder) {
      try {
        geocoderRef.current = new window.AMap.Geocoder();
      } catch (error) {
        console.error('初始化Geocoder失败:', error);
        // 如果直接创建失败，尝试通过plugin方式
        window.AMap.plugin('AMap.Geocoder', () => {
          try {
      geocoderRef.current = new window.AMap.Geocoder();
          } catch (e) {
            console.error('通过plugin初始化Geocoder也失败:', e);
          }
        });
      }
    } else {
      console.warn('AMap.Geocoder不可用，将使用工具函数');
    }
  };

  // // 初始化地图（如果需要）
  // const initMap = () => {
  //   if (!window.AMap || !mapRef.current) return;
    
  //   mapInstanceRef.current = new window.AMap.Map(mapRef.current, {
  //     center: [116.397428, 39.90923],
  //     resizeEnable: true,
  //     zoom: 16,
  //   });
  // };

  // 获取当前位置并解析地址
  const getCurrentLocationAndAddress = async () => {
    setLoading(true);
    setApiResponse(null);

    try {
      // 使用工具函数获取位置
      const position = await getCurrentPosition();
      
      // 使用工具函数进行逆地理编码
      const address = await reverseGeocode(position);
      
      // 解析地址信息（改进地址处理逻辑）
      let addressInfo;
      
      if (address.includes('附近') || address.includes('境内位置')) {
        // 离线地址解析结果 - 更精确地提取城市和区域信息
        
        // 提取完整的地区信息（例如：北京市海淀区 附近）
        const locationMatch = address.match(/^([^附近境内坐标]+)/);
        const locationStr = locationMatch ? locationMatch[1].trim() : '';
        
        if (locationStr) {
          // 解析省市区信息
          let province = '', city = '', district = '';
          
          // 处理直辖市的情况（如：北京市海淀区）
          if (locationStr.includes('北京市') || locationStr.includes('上海市') || 
              locationStr.includes('天津市') || locationStr.includes('重庆市')) {
            const directCityMatch = locationStr.match(/(北京市|上海市|天津市|重庆市)/);
            if (directCityMatch) {
              province = directCityMatch[1];
              city = directCityMatch[1];
              // 提取区
              const districtMatch = locationStr.match(/(北京市|上海市|天津市|重庆市)(.+)/);
              if (districtMatch && districtMatch[2]) {
                district = districtMatch[2];
              }
            }
          } else {
            // 处理普通省市的情况
            const provinceMatch = locationStr.match(/(.+?(?:省|自治区))/);
            if (provinceMatch) {
              province = provinceMatch[1];
            }
            
            const cityMatch = locationStr.match(/(.+?市)/);
            if (cityMatch) {
              city = cityMatch[1];
            }
            
            const districtMatch = locationStr.match(/市(.+?)(?:区|县)/);
            if (districtMatch) {
              district = districtMatch[1] + (locationStr.includes('区') ? '区' : '县');
            }
          }
          
          addressInfo = {
            province: province || '请选择省份',
            city: city || '请选择城市',
            district: district || '请选择区县',
            detail: `大概位置：${address}`
          };
        } else {
          addressInfo = {
            province: '请选择省份',
            city: '请选择城市',
            district: '请选择区县',
            detail: address
          };
        }
      } else if (address.includes('坐标')) {
        // 纯坐标显示 - 提供更友好的格式
        addressInfo = {
          province: '请选择省份',
          city: '请选择城市',
          district: '请选择区县',
          detail: '请输入详细地址（定位获取的坐标已保存）'
        };
      } else {
        // 正常的地址解析
        addressInfo = parseAddress(address);
      }
      
      setFormData(prev => ({
        ...prev,
        ...addressInfo,
        latitude: position.lat,
        longitude: position.lng
      }));

      // 根据地址类型显示不同的成功消息
      let successMessage;
      if (address.includes('附近') || address.includes('境内位置')) {
        successMessage = '定位成功（大概位置）';
      } else if (address.includes('坐标')) {
        successMessage = '定位成功（请手动完善地址）';
      } else {
        successMessage = '定位成功';
      }

      setApiResponse({
        success: true,
        message: successMessage,
        receivedData: {
          lng: position.lng,
          lat: position.lat
        }
      });

    } catch (error: any) {
      console.error('定位过程出错:', error);
      setApiResponse({
        success: false,
        message: error.message || '定位失败，请检查网络连接或GPS权限',
      });
    } finally {
      setLoading(false);
    }
  };

  // 解析地址字符串（改进版）
  const parseAddress = (address: string) => {
    // 更智能的地址解析逻辑
    const addressParts = {
      province: '',
      city: '',
      district: '',
      detail: address
    };

    try {
      // 匹配省份（包括直辖市、自治区、特别行政区）
      const provinceMatch = address.match(/(.*?(?:省|市|自治区|特别行政区))/);
      if (provinceMatch) {
        addressParts.province = provinceMatch[1];
      }

      // 匹配城市（在省份后面的市）
      let remainingAddress = address;
      if (addressParts.province) {
        remainingAddress = address.replace(addressParts.province, '');
      }
      
      const cityMatch = remainingAddress.match(/(.*?市)/);
      if (cityMatch) {
        addressParts.city = cityMatch[1];
      } else if (addressParts.province && addressParts.province.includes('市')) {
        // 直辖市情况
        addressParts.city = addressParts.province;
      }

      // 匹配区县
      if (addressParts.city) {
        remainingAddress = remainingAddress.replace(addressParts.city, '');
      }
      
      const districtMatch = remainingAddress.match(/(.*?(?:区|县|旗))/);
      if (districtMatch) {
        addressParts.district = districtMatch[1];
      }

      // 如果没有解析到基本信息，使用通用方案
      if (!addressParts.province && !addressParts.city) {
        // 尝试从地址中提取可能的地区名
        const locationMatch = address.match(/([^\d\s,，。.()（）]+(?:省|市|区|县|镇|街道|路|街))/);
        if (locationMatch) {
          const location = locationMatch[1];
          if (location.includes('省')) {
            addressParts.province = location;
          } else if (location.includes('市')) {
            addressParts.city = location;
          } else if (location.includes('区') || location.includes('县')) {
            addressParts.district = location;
          }
        }
      }

      // 设置默认值
      if (!addressParts.province) addressParts.province = '请选择省份';
      if (!addressParts.city) addressParts.city = '请选择城市';
      if (!addressParts.district) addressParts.district = '请选择区县';

    } catch (error) {
      console.error('地址解析出错:', error);
      // 解析失败时的默认值
      addressParts.province = '请选择省份';
      addressParts.city = '请选择城市';
      addressParts.district = '请选择区县';
    }

    return addressParts;
  };

  // 获取地址列表
  useEffect(() => {
    // TODO: 从API获取真实地址数据
    setAddresses([]);
  }, []);

  // 处理表单输入
  const handleInputChange = (field: keyof Address, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 保存地址
  const saveAddress = () => {
    if (!formData.recipient || !formData.phone || !formData.detail) {
      alert('请填写必要信息');
      return;
    }

    const newAddress: Address = {
      ...formData,
      id: Date.now().toString()
    };

    // 如果设为默认地址，则将其他地址的默认状态清除
    if (newAddress.isDefault) {
      setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })));
    }

    setAddresses(prev => [...prev, newAddress]);
    onAddressSelect(newAddress);
    setShowAddForm(false);
  };

  // 选择地址
  const selectAddress = (address: Address) => {
    onAddressSelect(address);
  };

  // 删除地址
  const deleteAddress = (id: string) => {
    if (confirm('确定要删除这个地址吗？')) {
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    }
  };

  return (
    <div className="address-selector-overlay">
      <div className="address-selector">
        <div className="address-selector-header">
          <h3>选择收货地址</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="address-selector-content">
          {!showAddForm ? (
            <>
              {/* 地址列表 */}
              <div className="address-list">
                {addresses.map((address) => (
                  <div 
                    key={address.id} 
                    className={`address-item ${currentAddress?.id === address.id ? 'selected' : ''}`}
                    onClick={() => selectAddress(address)}
                  >
                    <div className="address-info">
                      <div className="recipient-phone">
                        <span className="recipient">{address.recipient}</span>
                        <span className="phone">{address.phone}</span>
                        {address.isDefault && <span className="default-tag">默认</span>}
                      </div>
                      <div className="address-detail">
                        {address.province} {address.city} {address.district} {address.detail}
                      </div>
                    </div>
                    <div className="address-actions">
                      <button 
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAddress(address.id!);
                        }}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 添加新地址按钮 */}
              <button 
                className="add-address-btn"
                onClick={() => setShowAddForm(true)}
              >
                + 添加新地址
              </button>
            </>
          ) : (
            <>
              {/* 添加地址表单 */}
              <div className="add-address-form">
                <h4>添加新地址</h4>
                
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
                    placeholder="请输入手机号"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>省份</label>
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
                    <label>区县</label>
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
                  <textarea
                    value={formData.detail}
                    onChange={(e) => handleInputChange('detail', e.target.value)}
                    placeholder="请输入详细地址"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                    />
                    设为默认地址
                  </label>
                </div>

                {/* 获取当前位置按钮 */}
                <button 
                  className="location-btn"
                  onClick={getCurrentLocationAndAddress}
                  disabled={loading}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: loading ? '#ccc' : '#007AFF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    width: '100%',
                    marginBottom: '15px',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  {loading ? '定位中...' : '📍 获取当前位置'}
                </button>

                {/* 状态信息 */}
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                  地图状态: {
                    mapError ? '❌ 加载失败' : 
                    mapLoaded ? '✅ 已加载' : '⏳ 加载中...'
                  }
                  {mapError && <div style={{ color: '#ff4444', marginTop: '5px' }}>{mapError}</div>}
                  
                  {/* 给用户的提示 */}
                  <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f0f8ff', borderRadius: '4px', fontSize: '11px' }}>
                    💡 提示：定位后请检查并完善地址信息，确保收货准确无误
                  </div>
                </div>

                {/* API响应显示 */}
                {apiResponse && (
                  <div className={`api-response ${apiResponse.success ? 'success' : 'error'}`}>
                    <p>{apiResponse.message}</p>
                    {apiResponse.receivedData && (
                      <small>
                        坐标: {apiResponse.receivedData.lng.toFixed(6)}, {apiResponse.receivedData.lat.toFixed(6)}
                      </small>
                    )}
                  </div>
                )}

                <div className="form-actions">
                  <button 
                    className="cancel-btn"
                    onClick={() => setShowAddForm(false)}
                  >
                    取消
                  </button>
                  <button 
                    className="save-btn"
                    onClick={saveAddress}
                  >
                    保存
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressSelector; 