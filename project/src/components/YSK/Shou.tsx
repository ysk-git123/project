import React, { useState, useEffect } from 'react';
import { 
  NavBar, 
  SearchBar, 
  Swiper, 
  Grid, 
  Card, 
  Image, 
  Tag, 
  Button,
  Tabs,
  List,
  InfiniteScroll,
  Toast
} from 'antd-mobile';
import { 
  SearchOutline, 
  PayCircleOutline, 
  UserOutline,
  FireFill,
  GiftOutline,
  StarOutline
} from 'antd-mobile-icons';
import { GET } from '../../Axios/api';
import './Shou.css';

interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  color: string[];
  size: string[];
  description: string;
  category: string;
}

export default function Shou() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // 轮播图数据
  const bannerItems = [
    { id: 1, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', title: '新品上市' },
    { id: 2, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', title: '限时特惠' },
    { id: 3, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', title: '品牌精选' },
  ];

  // 分类数据
  const categories = [
    { key: 'all', title: '全部', icon: <FireFill /> },
    { key: 'clothing', title: '服装', icon: <GiftOutline /> },
    { key: 'shoes', title: '鞋靴', icon: <StarOutline /> },
    { key: 'accessories', title: '配饰', icon: <PayCircleOutline /> },
  ];

  // 获取商品数据
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await GET('/YSK/shop');
      console.log('商品数据响应:', response.data);
      if (response.data.success) {
        setProducts(response.data.data);
        console.log('设置商品数据:', response.data.data);
      }
    } catch (error) {
      console.error('获取商品失败:', error);
      Toast.show('获取商品失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 加载更多
  const loadMore = async () => {
    // 这里可以实现分页加载
    setHasMore(false);
  };

  // 搜索商品
  const onSearch = (value: string) => {
    console.log('搜索:', value);
    // 实现搜索功能
  };

  // 添加到购物车
  const addToCart = (product: Product) => {
    Toast.show('已添加到购物车');
  };

  // 商品卡片
  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="product-card">
      <div className="product-image">
        <Image src={product.image} width="100%" height={200} fit="cover" />
        {product.color.length > 0 && (
          <Tag color="primary" className="color-tag">
            {product.color[0]}
          </Tag>
        )}
      </div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-price">¥{product.price}</div>
        <div className="product-actions">
          <Button 
            size="small" 
            color="primary" 
            fill="outline"
            onClick={() => addToCart(product)}
          >
            加入购物车
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="mobile-shop">
      {/* 顶部导航栏 */}
      <NavBar 
        className="shop-navbar"
        right={
          <div className="nav-actions">
            <PayCircleOutline className="nav-icon" />
            <UserOutline className="nav-icon" />
          </div>
        }
      >
        商城首页
      </NavBar>

      {/* 搜索栏 */}
      <div className="search-container">
        <SearchBar
          placeholder="搜索商品"
          onSearch={onSearch}
          style={{
            '--border-radius': '100px',
            '--background': '#f5f5f5',
          }}
        />
      </div>

      {/* 轮播图 */}
      <div className="banner-container">
        <Swiper autoplay loop>
          {bannerItems.map((item) => (
            <Swiper.Item key={item.id}>
              <div className="banner-item">
                <Image src={item.image} width="100%" height={150} fit="cover" />
                <div className="banner-title">{item.title}</div>
              </div>
            </Swiper.Item>
          ))}
        </Swiper>
      </div>

      {/* 分类导航 */}
      <div className="category-container">
        <Grid columns={4} gap={8}>
          {categories.map((category) => (
            <Grid.Item key={category.key}>
              <div 
                className={`category-item ${activeTab === category.key ? 'active' : ''}`}
                onClick={() => setActiveTab(category.key)}
              >
                <div className="category-icon">{category.icon}</div>
                <div className="category-title">{category.title}</div>
              </div>
            </Grid.Item>
          ))}
        </Grid>
      </div>

      {/* 商品列表 */}
      <div className="products-container">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {categories.map((category) => (
            <Tabs.Tab title={category.title} key={category.key}>
              <List>
                <div className="products-grid">
                  {products.map((product) => (
                    <div key={product._id} className="product-item">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
                <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />
              </List>
            </Tabs.Tab>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
