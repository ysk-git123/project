import React, { useState } from 'react';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const LocationDiagnostic: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);

  const runDiagnostics = async () => {
    setRunning(true);
    setResults([]);

    const newResults: DiagnosticResult[] = [];

    // 1. 检查HTTPS
    if (window.location.protocol === 'https:') {
      newResults.push({
        test: 'HTTPS环境',
        status: 'success',
        message: '当前使用HTTPS协议，符合定位要求'
      });
    } else {
      newResults.push({
        test: 'HTTPS环境',
        status: 'warning',
        message: '当前使用HTTP协议，某些浏览器可能限制定位功能'
      });
    }

    // 2. 检查浏览器支持
    if (navigator.geolocation) {
      newResults.push({
        test: '浏览器地理定位支持',
        status: 'success',
        message: '浏览器支持地理定位API'
      });
    } else {
      newResults.push({
        test: '浏览器地理定位支持',
        status: 'error',
        message: '浏览器不支持地理定位API'
      });
    }

    // 3. 检查网络连接
    if (navigator.onLine) {
      newResults.push({
        test: '网络连接',
        status: 'success',
        message: '网络连接正常'
      });
    } else {
      newResults.push({
        test: '网络连接',
        status: 'error',
        message: '网络连接异常，可能影响定位功能'
      });
    }

    // 4. 检查高德地图API
    try {
      const script = document.createElement('script');
      script.src = 'https://webapi.amap.com/maps?v=2.0&key=284cf2c61352c1e151c799fb26765f1b&plugin=AMap.Geolocation';
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      if (window.AMap) {
        newResults.push({
          test: '高德地图API加载',
          status: 'success',
          message: '高德地图API加载成功'
        });
      } else {
        newResults.push({
          test: '高德地图API加载',
          status: 'error',
          message: '高德地图API加载失败'
        });
      }
    } catch (error) {
      newResults.push({
        test: '高德地图API加载',
        status: 'error',
        message: `高德地图API加载失败: ${error}`
      });
    }

    // 5. 测试浏览器原生定位
    if (navigator.geolocation) {
      try {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              newResults.push({
                test: '浏览器原生定位测试',
                status: 'success',
                message: '浏览器原生定位功能正常',
                details: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy
                }
              });
              resolve(position);
            },
            (error) => {
              let message = '浏览器原生定位失败';
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  message = '用户拒绝了定位权限';
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
              newResults.push({
                test: '浏览器原生定位测试',
                status: 'error',
                message
              });
              reject(error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000
            }
          );
        });
      } catch (error) {
        // 错误已在回调中处理
      }
    }

    // 6. 测试高德地图定位
    if (window.AMap) {
      try {
        await new Promise((resolve, reject) => {
          const geolocation = new window.AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000,
            showButton: false,
          });

          geolocation.getCurrentPosition((status, result) => {
            if (status === 'complete') {
              newResults.push({
                test: '高德地图定位测试',
                status: 'success',
                message: '高德地图定位功能正常',
                details: {
                  latitude: result.position.getLat(),
                  longitude: result.position.getLng(),
                  accuracy: result.accuracy
                }
              });
              resolve(result);
            } else {
              newResults.push({
                test: '高德地图定位测试',
                status: 'error',
                message: result.message || '高德地图定位失败'
              });
              reject(new Error(result.message));
            }
          });
        });
      } catch (error) {
        // 错误已在回调中处理
      }
    }

    // 7. 检查后端服务
    try {
      const response = await fetch('http://localhost:3001/YJL/health');
      if (response.ok) {
        newResults.push({
          test: '后端服务连接',
          status: 'success',
          message: '后端服务连接正常'
        });
      } else {
        newResults.push({
          test: '后端服务连接',
          status: 'error',
          message: '后端服务连接失败'
        });
      }
    } catch (error) {
      newResults.push({
        test: '后端服务连接',
        status: 'error',
        message: '后端服务连接失败，请确保服务已启动'
      });
    }

    setResults(newResults);
    setRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>定位功能诊断工具</h1>
      <p>此工具将帮助您诊断定位功能的问题</p>
      
      <button
        onClick={runDiagnostics}
        disabled={running}
        style={{
          padding: '10px 20px',
          backgroundColor: running ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: running ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {running ? '诊断中...' : '开始诊断'}
      </button>

      {results.length > 0 && (
        <div>
          <h2>诊断结果</h2>
          {results.map((result, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #ddd',
                borderRadius: '5px',
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ marginRight: '10px', fontSize: '18px' }}>
                  {getStatusIcon(result.status)}
                </span>
                <strong style={{ color: getStatusColor(result.status) }}>
                  {result.test}
                </strong>
              </div>
              <p style={{ margin: '5px 0' }}>{result.message}</p>
              {result.details && (
                <details style={{ marginTop: '10px' }}>
                  <summary>详细信息</summary>
                  <pre style={{
                    background: '#f5f5f5',
                    padding: '10px',
                    borderRadius: '3px',
                    fontSize: '12px'
                  }}>
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
          <h3>建议</h3>
          <ul>
            <li>如果HTTPS环境检查失败，请使用HTTPS协议访问</li>
            <li>如果定位权限被拒绝，请在浏览器设置中允许定位权限</li>
            <li>如果网络连接异常，请检查网络设置</li>
            <li>如果后端服务连接失败，请确保后端服务已启动</li>
            <li>如果高德地图API加载失败，请检查网络连接和API Key</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LocationDiagnostic; 