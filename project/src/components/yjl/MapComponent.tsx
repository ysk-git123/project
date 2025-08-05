import React, { useEffect, useRef, useState } from "react";
import { Button, Toast, SearchBar, DotLoading, NavBar } from "antd-mobile";
import { useLocation, useNavigate } from "react-router-dom";
import { AimOutlined } from "@ant-design/icons";
import "./MapComponent.module.css";
import { loadAMapScript, getCurrentPosition, reverseGeocode } from "../../utils/mapUtils";

// 直接在这里定义Position类型，避免导入问题
interface Position {
  lng: number;
  lat: number;
}

// Define types for suggestion
interface Suggestion {
  name: string;
  district?: string;
  location?: {
    lng: number;
    lat: number;
  };
  [key: string]: any;
}

declare global {
  interface Window {
    AMap: any;
  }
}

interface MapComponentProps {
  onAddressSelect?: (address: string, position: Position) => void;
  onBack?: () => void;
  title?: string;
  buttonText?: string;
  showSearch?: boolean;
  initialPosition?: Position;
}

const MapComponent: React.FC<MapComponentProps> = ({
  onAddressSelect,
  onBack,
  title = "获取位置信息",
  buttonText = "确认位置",
  showSearch = true,
  initialPosition
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [address, setAddress] = useState<string>("");
  const [position, setPosition] = useState<Position | null>(initialPosition || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const placeSearch = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autoComplete = useRef<any>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // 高德地图Key - 统一配置
  const AMAP_KEY = '284cf2c61352c1e151c799fb26765f1b';

  // 初始化地图
  useEffect(() => {
    loadAMapScript().then(() => {
      initMap();
    }).catch(error => {
      console.error('加载地图失败:', error);
      Toast.show({ icon: "fail", content: "地图加载失败" });
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
      }
    };
  }, []);

  const initMap = async () => {
    if (!window.AMap || !mapContainer.current) return;
    
    try {
      mapInstance.current = new window.AMap.Map(mapContainer.current, {
        center: initialPosition ? [initialPosition.lng, initialPosition.lat] : [116.397428, 39.90923],
        resizeEnable: true,
        zoom: 16,
      });

      // 初始化 PlaceSearch 和 AutoComplete
      window.AMap.plugin(["AMap.PlaceSearch", "AMap.AutoComplete"], () => {
        // 地点搜索插件
        placeSearch.current = new window.AMap.PlaceSearch({
          map: mapInstance.current,
          pageSize: 10,
          pageIndex: 1,
          city: "全国",
        });

        // 自动完成插件
        if (showSearch) {
          autoComplete.current = new window.AMap.AutoComplete({
            city: "全国",
          });
        }
      });

      // 监听地图点击事件
      mapInstance.current.on("click", onMapClick);
      
      // 如果有初始位置，直接设置
      if (initialPosition) {
        addMarker(initialPosition);
        await reverseGeocode(initialPosition).then(addr => setAddress(addr));
      } else {
        // 否则获取当前位置
        getLocationAndClockIn();
      }
    } catch (error) {
      console.error('地图初始化失败:', error);
      Toast.show({ icon: "fail", content: "地图初始化失败" });
    }
  };

  // 处理输入变化，获取位置建议
  const handleInputChange = (value: string) => {
    setSearchValue(value);

    if (!value || !autoComplete.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // 获取输入建议
    autoComplete.current.search(value, (status: string, result: any) => {
      if (status === "complete" && result.tips && result.tips.length) {
        setSuggestions(result.tips);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    });
  };

  // 处理建议项点击
  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (!suggestion || !placeSearch.current) return;

    setSearchValue(suggestion.name);
    setShowSuggestions(false);

    // 搜索选中的位置
    placeSearch.current.search(suggestion.name, (status: string, result: any) => {
      if (
        status === "complete" &&
        result.poiList &&
        result.poiList.pois.length > 0
      ) {
        const poi = result.poiList.pois[0];
        const lnglat = poi.location;

        // 设置地图中心
        mapInstance.current.setCenter([lnglat.lng, lnglat.lat]);

        // 清除旧标记并添加新标记
        if (markerRef.current) {
          mapInstance.current.remove(markerRef.current);
          markerRef.current = null;
        }

        markerRef.current = new window.AMap.Marker({
          position: [lnglat.lng, lnglat.lat],
          title: poi.name,
        });
        mapInstance.current.add(markerRef.current);

        // 更新位置和地址
        setPosition({ lng: lnglat.lng, lat: lnglat.lat });
        setAddress(poi.address || poi.name);
      } else {
        Toast.show({ icon: "fail", content: "未找到相关地点" });
      }
    });
  };

  // 搜索功能
  const handleSearch = (value: string) => {
    if (!value || !placeSearch.current) return;
    setShowSuggestions(false);

    placeSearch.current.search(value, (status: string, result: any) => {
      if (
        status === "complete" &&
        result.poiList &&
        result.poiList.pois.length > 0
      ) {
        const poi = result.poiList.pois[0];
        const lnglat = poi.location;
        mapInstance.current.setCenter([lnglat.lng, lnglat.lat]);

        // 先移除旧的 marker
        if (markerRef.current) {
          mapInstance.current.remove(markerRef.current);
          markerRef.current = null;
        }

        // 添加新 marker
        markerRef.current = new window.AMap.Marker({
          position: [lnglat.lng, lnglat.lat],
          title: poi.name,
        });
        mapInstance.current.add(markerRef.current);
        setPosition({ lng: lnglat.lng, lat: lnglat.lat });
        setAddress(poi.address || poi.name);
      } else {
        Toast.show({ icon: "fail", content: "未找到相关地点" });
      }
    });
  };

  // 地图点击事件处理
  const onMapClick = (e: any) => {
    // 关闭建议列表
    setShowSuggestions(false);

    const lnglat = e.lnglat;
    // 先移除旧的 marker
    if (markerRef.current) {
      mapInstance.current.remove(markerRef.current);
      markerRef.current = null;
    }
    // 添加新 marker
    markerRef.current = new window.AMap.Marker({
      position: [lnglat.lng, lnglat.lat],
      title: "自选位置",
    });
    mapInstance.current.add(markerRef.current);
    setPosition({ lng: lnglat.lng, lat: lnglat.lat });
    // 逆地理编码
    reverseGeocode({ lng: lnglat.lng, lat: lnglat.lat }).then(addr => setAddress(addr));
  };

  // 获取定位并定位
  const getLocationAndClockIn = async () => {
    setIsLoading(true);
    try {
      // 清空搜索框和建议列表
      setSearchValue("");
      setShowSuggestions(false);
      setSuggestions([]);

      // 1. 获取定位
      const position = await getCurrentPosition();

      // 2. 立即执行逆地理编码
      const addr = await reverseGeocode(position);
      setAddress(addr);

      // 3. 添加标记
      addMarker(position);

      // 4. 设置地图中心点
      mapInstance.current?.setCenter([position.lng, position.lat]);
      // 5. 设置适当的缩放级别
      mapInstance.current?.setZoom(16);
    } catch (error) {
      handleError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // 错误处理
  const handleError = (error: Error) => {
    const errorMsg = error.message || "定位失败";
    Toast.show({
      icon: "fail",
      content: errorMsg,
    });
  };

  // 监听位置变化执行逆地理编码
  useEffect(() => {
    if (position) {
      reverseGeocode(position).then(addr => setAddress(addr)).catch(console.error);
    }
  }, [position]);

  // 添加定位点标记
  const addMarker = (position: Position) => {
    // 先移除旧的 marker
    if (markerRef.current) {
      mapInstance.current.remove(markerRef.current);
      markerRef.current = null;
    }
    markerRef.current = new window.AMap.Marker({
      position: new window.AMap.LngLat(position.lng, position.lat),
      title: "当前位置",
    });
    mapInstance.current.add(markerRef.current);
  };

  // 确认位置
  const confirmLocation = () => {
    if (!position || !address) {
      Toast.show({ icon: "fail", content: "请先选择位置" });
      return;
    }

    if (onAddressSelect) {
      onAddressSelect(address, position);
    } else {
      // 默认行为：保存到sessionStorage并导航
      sessionStorage.setItem("selectedAddress", address);
      sessionStorage.setItem("selectedPosition", JSON.stringify(position));
      Toast.show({ icon: "success", content: "位置已保存" });
      navigate(-1);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="map-component-container">
      <NavBar onBack={handleBack}>{title}</NavBar>
      
      {/* 搜索框与建议列表 */}
      {showSearch && (
        <div className="map-search-container">
          <SearchBar
            placeholder="搜索地点"
            value={searchValue}
            onChange={handleInputChange}
            onSearch={handleSearch}
            showCancelButton
          />

          {/* 建议列表 */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="map-suggestions-list">
              {suggestions.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(item)}
                  className={
                    index < suggestions.length - 1
                      ? "map-suggestion-item-with-border"
                      : "map-suggestion-item"
                  }
                >
                  <div className="map-suggestion-title">{item.name}</div>
                  {item.district && (
                    <div className="map-suggestion-district">
                      {item.district}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 地图容器及悬浮按钮 */}
      <div className="map-container">
        <div ref={mapContainer} className="map-element" />
        {/* 右下角悬浮重新定位按钮 */}
        <div className="map-location-button" onClick={getLocationAndClockIn}>
          {isLoading ? (
            <DotLoading color="#666666" style={{ fontSize: "18px" }} />
          ) : (
            <AimOutlined className="map-location-icon" />
          )}
        </div>
      </div>

      {/* 位置信息 */}
      {position && (
        <div className="map-address-info">
          <p className="map-address-text">
            当前位置：
            <br />
            {address}
          </p>
        </div>
      )}

      {/* 确认位置按钮 */}
      <Button 
        color="primary" 
        loading={isLoading} 
        onClick={confirmLocation} 
        block
        disabled={!position || !address}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default MapComponent; 