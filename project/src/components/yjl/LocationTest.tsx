import React, { useState, useEffect } from 'react';

// 声明AMap类型
declare global {
  interface Window {
    AMap: {
      Geolocation: new (options: Record<string, unknown>) => {
        getCurrentPosition: (callback: (status: string, result: any) => void) => void;
      };
    };
  }
}

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

const LocationTest: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  // 获取当前位置
  const getCurrentLocation = async (sendToServer: boolean = false): Promise<void> => {
    setLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      // 动态加载高德地图JS API
      if (!window.AMap) {
        await loadAMapScript();
      }

      const result = await getAMapLocation();
      
      if (result.success && result.position) {
        setPosition({
          lng: result.position.lng,
          lat: result.position.lat,
          accuracy: result.accuracy
        });

        if (sendToServer) {
          const response = await sendLocationToServer({
            lng: result.position.lng,
            lat: result.position.lat,
            accuracy: result.accuracy
          });
          setApiResponse(response);
        }
      } else {
        setError(result.message || '获取位置失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '定位服务异常');
    } finally {
      setLoading(false);
    }
  };

  // 加载高德地图JS
  const loadAMapScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://webapi.amap.com/maps?v=2.0&key=284cf2c61352c1e151c799fb26765f1b&plugin=AMap.Geolocation`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('加载高德地图API失败'));
      document.head.appendChild(script);
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
      const geolocation = new window.AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        showButton: false,
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
    } catch (err) {
      throw new Error('发送位置到服务器失败');
    }
  };

  // 组件加载时自动获取位置(不发送到服务器)
  useEffect(() => {
    getCurrentLocation(false);
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>高德地图定位服务测试</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => getCurrentLocation(false)}
          style={{ marginRight: '10px', padding: '10px 20px' }}
        >
          获取当前位置
        </button>
        <button 
          onClick={() => getCurrentLocation(true)}
          style={{ padding: '10px 20px' }}
        >
          获取并发送到服务器
        </button>
      </div>

      {loading && (
        <div style={{ color: 'blue', marginBottom: '10px' }}>
          定位中...
        </div>
      )}

      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          <h3>定位失败</h3>
          <p>{error}</p>
        </div>
      )}

      {position && (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>当前位置信息</h3>
          <p>经度: {position.lng.toFixed(6)}</p>
          <p>纬度: {position.lat.toFixed(6)}</p>
          {position.accuracy && <p>精度: {position.accuracy.toFixed(0)}米</p>}
        </div>
      )}

      {apiResponse && (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>服务器响应</h3>
          <p>状态: {apiResponse.success ? '成功' : '失败'}</p>
          <p>消息: {apiResponse.message}</p>
          {apiResponse.receivedData && (
            <div>
              <p>服务器接收到的数据:</p>
              <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '3px' }}>
                {JSON.stringify(apiResponse.receivedData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationTest; 