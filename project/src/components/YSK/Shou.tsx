import React, { useState, useEffect } from 'react';
import {
  NavBar,
  SearchBar,
  Swiper,
  Card,
  Image,
  Tag,
  List,
  InfiniteScroll,
  Toast,
  TabBar,
  Skeleton
} from 'antd-mobile';
import {
  PayCircleOutline,
  UserOutline,
  FireFill,
  GiftOutline,
  StarOutline,
  AppOutline,
  UnorderedListOutline
} from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { GET } from '../../Axios/api';
import styles from './Shou.module.css';

interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  color: string[];
  // size: string[];
  // description: string;
  category: string;
}

// 分类图标映射
const categoryIcons: Record<string, React.ReactNode> = {
  all: <FireFill />,
  // 服装类
  '短袖': <GiftOutline />,
  '卫衣': <GiftOutline />,
  '长袖': <GiftOutline />,
  '外套': <GiftOutline />,
  '裤子': <GiftOutline />,
  '裙子': <GiftOutline />,
  'T恤': <GiftOutline />,
  '衬衫': <GiftOutline />,
  '毛衣': <GiftOutline />,
  '夹克': <GiftOutline />,
  '羽绒服': <GiftOutline />,
  '运动服': <GiftOutline />,
  // 鞋靴类
  '鞋靴': <StarOutline />,
  '运动鞋': <StarOutline />,
  '休闲鞋': <StarOutline />,
  '皮鞋': <StarOutline />,
  '靴子': <StarOutline />,
  // 配饰类
  '配饰': <PayCircleOutline />,
  '帽子': <PayCircleOutline />,
  '包包': <PayCircleOutline />,
  '腰带': <PayCircleOutline />,
  '围巾': <PayCircleOutline />,
  '手套': <PayCircleOutline />,
  // 其他
  '内衣': <GiftOutline />,
  '泳装': <GiftOutline />,
  '家居服': <GiftOutline />,
};

// 分类名称映射
const categoryNames: Record<string, string> = {
  all: '全部',
  // 服装类
  '短袖': '短袖',
  '卫衣': '卫衣',
  '长袖': '长袖',
  '外套': '外套',
  '裤子': '裤子',
  '裙子': '裙子',
  'T恤': 'T恤',
  '衬衫': '衬衫',
  '毛衣': '毛衣',
  '夹克': '夹克',
  '羽绒服': '羽绒服',
  '运动服': '运动服',
  // 鞋靴类
  '鞋靴': '鞋靴',
  '运动鞋': '运动鞋',
  '休闲鞋': '休闲鞋',
  '皮鞋': '皮鞋',
  '靴子': '靴子',
  // 配饰类
  '配饰': '配饰',
  '帽子': '帽子',
  '包包': '包包',
  '腰带': '腰带',
  '围巾': '围巾',
  '手套': '手套',
  // 其他
  '内衣': '内衣',
  '泳装': '泳装',
  '家居服': '家居服',
};

export default function Shou() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [activeTab, setActiveTab] = useState('all'); // 默认选中"全部"
  const [currentPage, setCurrentPage] = useState(1); // 当前页码
  const pageSize = 10; // 每页数量
  const [categoriesLoading, setCategoriesLoading] = useState(true); // 分类加载状态
  const [productsLoading, setProductsLoading] = useState(true); // 商品加载状态
  const [showSkeleton, setShowSkeleton] = useState(true); // 控制骨架屏显示
  const [bannerLoading, setBannerLoading] = useState(true); // 轮播图加载状态

  // 轮播图数据
  const bannerItems = [
    { id: 1, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', title: '新品上市' },
    { id: 2, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', title: '限时特惠' },
    { id: 3, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', title: '品牌精选' },
  ];

  // 获取分类
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await GET('/YSK/shop/categories');
      if (response.data.success) {
        // 添加"全部"分类到最前面
        const allCategories = ['all', ...response.data.data];
        setCategories(allCategories);
        console.log('获取到的分类:', allCategories);
      } else {
        // 如果获取失败，使用默认分类
        setCategories(['all', '短袖', '卫衣', '长袖', '外套']);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
      // 使用默认分类作为备选
      setCategories(['all', '短袖', '卫衣', '长袖', '外套']);
    } finally {
      // 延迟隐藏分类骨架屏
      setTimeout(() => {
        setCategoriesLoading(false);
      }, 1500); // 延迟1.5秒
    }
  };

  // 获取商品数据
  const fetchProducts = async (page = 1, isLoadMore = false) => {
    try {
      setLoading(true);
      if (!isLoadMore) {
        setProductsLoading(true);
      }
      const response = await GET(`/YSK/shop?page=${page}&pageSize=${pageSize}`);
      if (response.data.success) {
        const { list, pagination } = response.data.data;

        // 防御性检查：确保list是数组
        const productsList = Array.isArray(list) ? list : [];

        if (isLoadMore) {
          // 加载更多时，追加数据
          setProducts(prev => [...prev, ...productsList]);
        } else {
          // 首次加载或刷新时，替换数据
          setProducts(productsList);
        }

        setCurrentPage(pagination.current);
        setHasMore(pagination.hasMore);
        console.log(`第${page}页商品数据:`, productsList);
      }
    } catch (error) {
      console.error('获取商品失败:', error);
      Toast.show('获取商品失败');
    } finally {
      setLoading(false);
      // 延迟隐藏商品骨架屏
      setTimeout(() => {
        setProductsLoading(false);
      }, 2000); // 延迟2秒
    }
  };

  // 触底加载更多
  const loadMore = async () => {
    if (loading || !hasMore) return;
    await fetchProducts(currentPage + 1, true);
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts(1, false);
    
    // 设置轮播图骨架屏延迟
    setTimeout(() => {
      setBannerLoading(false);
    }, 1000); // 轮播图延迟1秒
    
    // 设置初始骨架屏显示时间
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 3000); // 初始显示3秒

    return () => clearTimeout(timer);
  }, []);

  // 跳转到分类页面
  const handleCategoryClick = (category: string) => {
    setActiveTab(category); // 更新选中状态
    if (category === 'all') {
      // 全部分类就在当前页面显示所有商品
      setCurrentPage(1); // 重置页码
      setHasMore(true); // 重置加载状态
      fetchProducts(1, false);
    } else {
      // 其他分类跳转到分类页面
      navigate(`/category/${encodeURIComponent(category)}`);
    }
  };

  // 获取分类显示名称
  const getCategoryDisplayName = (category: string) => {
    if (category === 'all') return '全部';
    return categoryNames[category] || category; // 如果没有映射，直接显示分类名
  };

  // 获取分类图标
  const getCategoryIcon = (category: string) => {
    if (category === 'all') return <FireFill />;

    // 根据分类名称智能匹配图标
    if (categoryNames[category]) {
      return categoryIcons[category] || <GiftOutline />;
    }

    // 对于未知分类，根据关键词智能匹配
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('鞋') || categoryLower.includes('靴')) {
      return <StarOutline />;
    } else if (categoryLower.includes('包') || categoryLower.includes('帽') ||
      categoryLower.includes('配') || categoryLower.includes('饰')) {
      return <PayCircleOutline />;
    } else {
      return <GiftOutline />; // 默认为服装类图标
    }
  };


  // 分类骨架屏组件
  const CategorySkeleton = () => (
    <div className={styles['category-container']}>
      <div className={styles['category-scroll']}>
        <div className={styles['category-pages']}>
          <div className={styles['category-page']}>
            <div className={styles['category-grid']}>
              {/* 第一行骨架屏 */}
              <div className={styles['category-row']}>
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className={styles['category-grid-item']}>
                    <div className={styles['category-icon']}>
                      <Skeleton.Title animated style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                    </div>
                    <div className={styles['category-title']}>
                      <Skeleton.Title animated style={{ width: '40px', height: '12px', borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
              {/* 第二行骨架屏 */}
              <div className={styles['category-row']}>
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index + 3} className={styles['category-grid-item']}>
                    <div className={styles['category-icon']}>
                      <Skeleton.Title animated style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                    </div>
                    <div className={styles['category-title']}>
                      <Skeleton.Title animated style={{ width: '40px', height: '12px', borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 商品骨架屏组件
  const ProductSkeleton = () => (
    <div className={styles['products-container']}>
      <List>
        <div className={styles['products-grid']}>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className={styles['product-item']}>
              <Card className={styles['product-card']}>
                <div className={styles['product-image']}>
                  <Skeleton.Title animated style={{ width: '100%', height: '200px', borderRadius: '8px' }} />
                </div>
                <div className={styles['product-info']}>
                  <div className={styles['product-name']}>
                    <Skeleton.Title animated style={{ width: '80%', height: '16px', borderRadius: '4px', marginBottom: '8px' }} />
                  </div>
                  <div className={styles['product-price']}>
                    <Skeleton.Title animated style={{ width: '60%', height: '14px', borderRadius: '4px' }} />
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </List>
    </div>
  );

  // 轮播图骨架屏组件
  const BannerSkeleton = () => (
    <div className={styles['banner-skeleton']}>
      <div className={styles['banner-skeleton-content']}>
        <Skeleton.Title animated style={{ width: '100%', height: '150px', borderRadius: '12px' }} />
      </div>
    </div>
  );

  // 商品卡片
  const ProductCard = ({ product }: { product: Product }) => (
    <Card className={styles['product-card']}>
      <div className={styles['product-image']}>
        <Image src={product.image} width="100%" height={200} fit="cover" />
        {product.color.length > 0 && (
          <Tag color="primary" className={styles['color-tag']}>
            {product.color[0]}
          </Tag>
        )}
      </div>
      <div className={styles['product-info']}>
        <div className={styles['product-name']}>{product.name}</div>
        <div className={styles['product-price']}>¥{product.price}</div>
      </div>
    </Card>
  );

  return (
    <div className={styles['mobile-shop']}>
      {/* 顶部导航栏 */}
      <NavBar className={styles['shop-navbar']} backArrow={false}>
        商城首页
      </NavBar>

      {/* 搜索栏 */}
      <div className={styles['search-container']}>
        <SearchBar
          placeholder="搜索商品"
          style={{
            '--border-radius': '100px',
            '--background': '#f5f5f5',
          }}
        />
      </div>

      {/* 轮播图 */}
      {bannerLoading || showSkeleton ? (
        <BannerSkeleton />
      ) : (
        <div className={styles['banner-container']}>
          <Swiper autoplay loop>
            {bannerItems.map((item) => (
              <Swiper.Item key={item.id}>
                <div className={styles['banner-item']}>
                  <Image src={item.image} width="100%" height={150} fit="cover" />
                  <div className={styles['banner-title']}>{item.title}</div>
                </div>
              </Swiper.Item>
            ))}
          </Swiper>
        </div>
      )}

      {/* 分类导航 */}
      {categoriesLoading || showSkeleton ? (
        <CategorySkeleton />
      ) : (
        <div className={styles['category-container']}>
          <div className={styles['category-scroll']}>
            <div className={styles['category-pages']}>
              {/* 计算需要多少页 */}
              {Array.from({ length: Math.ceil(categories.length / 6) }, (_, pageIndex) => (
                <div key={pageIndex} className={styles['category-page']}>
                  <div className={styles['category-grid']}>
                    {/* 第一行 */}
                    <div className={styles['category-row']}>
                      {categories.slice(pageIndex * 6, pageIndex * 6 + 3).map((category) => (
                        <div
                          key={category}
                          className={`${styles['category-grid-item']} ${activeTab === category ? styles.active : ''}`}
                          onClick={() => handleCategoryClick(category)}
                        >
                          <div className={styles['category-icon']}>
                            {getCategoryIcon(category)}
                          </div>
                          <div className={styles['category-title']}>
                            {getCategoryDisplayName(category)}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* 第二行 */}
                    <div className={styles['category-row']}>
                      {categories.slice(pageIndex * 6 + 3, (pageIndex + 1) * 6).map((category) => (
                        <div
                          key={category}
                          className={`${styles['category-grid-item']} ${activeTab === category ? styles.active : ''}`}
                          onClick={() => handleCategoryClick(category)}
                        >
                          <div className={styles['category-icon']}>
                            {getCategoryIcon(category)}
                          </div>
                          <div className={styles['category-title']}>
                            {getCategoryDisplayName(category)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 商品列表 */}
      {productsLoading || showSkeleton ? (
        <ProductSkeleton />
      ) : (
        <div className={styles['products-container']}>
          <List>
            <div className={styles['products-grid']}>
              {products.length === 0 && !loading && (
                <div className={styles['empty-container']}>暂无商品</div>
              )}
              {products.map((product) => (
                <div key={product._id} className={styles['product-item']}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />
          </List>
        </div>
      )}

      {/* 底部标签栏 */}
      <TabBar className={styles['tab-bar']}>
        <TabBar.Item
          key="home"
          icon={<AppOutline />}
          title="首页"
          onClick={() => handleCategoryClick('all')}
        />
        <TabBar.Item
          key="categories"
          icon={<UnorderedListOutline />}
          title="分类"
          onClick={() => handleCategoryClick('all')}
        />
        <TabBar.Item
          key="cart"
          icon={<GiftOutline />}
          title="购物车"
          onClick={() => navigate('/cart')}
        />
        <TabBar.Item
          key="profile"
          icon={<UserOutline />}
          title="我的"
          onClick={() => navigate('/profile')}
        />
      </TabBar>
    </div>
  );
}
