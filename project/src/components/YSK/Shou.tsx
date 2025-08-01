import React, { useState, useEffect } from 'react';
import {
  NavBar,
  Swiper,
  Card,
  Image,
  Tag,
  List,
  InfiniteScroll,
  TabBar,
  Skeleton,
  Avatar,
  Button,
  Toast
} from 'antd-mobile';
import {
  PayCircleOutline,
  UserOutline,
  FireFill,
  GiftOutline,
  StarOutline,
  AppOutline,
  UnorderedListOutline,
  RightOutline,
  TruckOutline,
  LocationOutline,
  HeartOutline,
  SearchOutline,
  MessageOutline,
  SetOutline
} from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { GET } from '../../Axios/api';
import styles from './ModuleCSS/Shou.module.css'

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

// 全局缓存对象
let homeCache: {
  categories?: string[];
  products?: Product[];
} = {};

// 新增：判断两个数组是否相等（浅比较即可）
function shallowEqualArray<T>(a: T[] = [], b: T[] = []) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export default function Shou() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(homeCache.products || []);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState<string[]>(homeCache.categories || []);
  const [activeTab, setActiveTab] = useState('all'); // 默认选中"全部"
  const [currentPage, setCurrentPage] = useState(1); // 当前页码
  const pageSize = 10; // 每页数量
  const [showSkeleton, setShowSkeleton] = useState(!homeCache.categories || !homeCache.products); // 控制骨架屏显示，默认不显示
  const [updating, setUpdating] = useState(false); // 新增：局部更新 loading

  // 新增：底部标签栏状态
  const [activeBottomTab, setActiveBottomTab] = useState('home'); // 底部标签栏当前选中的标签

  // 轮播图数据
  const bannerItems = [
    { id: 1, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', title: '新品上市' },
    { id: 2, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', title: '限时特惠' },
    { id: 3, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', title: '品牌精选' },
  ];

  // 获取分类
  const fetchCategories = async () => {
    try {
      const response = await GET('/YSK/shop/categories');
      if (response.data.success) {
        return ['all', ...response.data.data];
      } else {
        return ['all', '短袖', '卫衣', '长袖', '外套'];
      }
    } catch {
      return ['all', '短袖', '卫衣', '长袖', '外套'];
    }
  };

  // 支持分页的 fetchProducts
  const fetchProducts = async (page = 1) => {
    try {
      const response = await GET(`/YSK/shop?page=${page}&pageSize=${pageSize}`);
      if (response.data.success) {
        const { list, pagination } = response.data.data;
        return {
          list: Array.isArray(list) ? list : [],
          hasMore: pagination?.hasMore ?? false
        };
      } else {
        return { list: [], hasMore: false };
      }
    } catch {
      return { list: [], hasMore: false };
    }
  };

  // 触底加载更多
  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = currentPage + 1;
    const { list: newList, hasMore: more } = await fetchProducts(nextPage);
    setProducts(prev => [...prev, ...newList]);
    setCurrentPage(nextPage);
    setHasMore(more);
    setLoading(false);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    // 1. 先用缓存渲染页面
    if (homeCache.categories && homeCache.products) {
      setShowSkeleton(false);
      setCategories(homeCache.categories);
      setProducts(homeCache.products);
      // 2. 后台静默拉取新数据
      setUpdating(true);
      Promise.all([fetchCategories(), fetchProducts(1)]).then(([cats, prodsRes]) => {
        setUpdating(false);
        let catsChanged = !shallowEqualArray(cats, homeCache.categories);

        let prodsChanged = !shallowEqualArray(prodsRes.list.map(p => p._id), (homeCache.products || []).map(p => p._id));
        if (catsChanged) {
          setCategories(cats);
          homeCache.categories = cats;
        }
        if (prodsChanged) {
          setProducts(prodsRes.list);
          homeCache.products = prodsRes.list;
        }
        setCurrentPage(1);
        setHasMore(prodsRes.hasMore);
      });
    } else {
      // 首次加载，显示骨架屏
      setShowSkeleton(true);
      Promise.all([fetchCategories(), fetchProducts(1)]).then(([cats, prodsRes]) => {
        homeCache.categories = cats;
        homeCache.products = prodsRes.list;
        timer = setTimeout(() => {
          setCategories(cats);
          setProducts(prodsRes.list);
          setCurrentPage(1);
          setHasMore(prodsRes.hasMore);
          setShowSkeleton(false);
        }, 2500);
      });
    }
    return () => clearTimeout(timer);
  }, []);

  // 跳转到分类页面
  const handleCategoryClick = (category: string) => {
    setActiveTab(category); // 更新选中状态
    if (category === 'all') {
      setCurrentPage(1); // 重置页码
      setHasMore(true); // 重置加载状态
      // 从分类页面返回时，不显示骨架屏
      if (!homeCache.categories || !homeCache.products) {
        fetchProducts();
      }
    } else {
      // 其他分类跳转到分类页面
      navigate(`/category/${encodeURIComponent(category)}`);
    }
  };

  // 新增：处理底部标签栏点击
  const handleBottomTabClick = (key: string) => {
    setActiveBottomTab(key);
  };

  // 新增：渲染不同标签页的内容
  const renderTabContent = () => {
    switch (activeBottomTab) {
      case 'home':
      case 'categories':
        return (
          <>
            {/* 轮播图 */}
            {showSkeleton ? (
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
            {showSkeleton ? (
              <CategorySkeleton />
            ) : (
              <div className={styles['category-container']}>
                <div className={styles['category-scroll']}>
                  <div className={styles['category-pages']}>
                    {/* 计算需要多少页 */}
                    {Array.from({ length: Math.ceil(categories.length / 16) }, (_, pageIndex) => (
                      <div key={pageIndex} className={styles['category-page']}>
                        <div className={styles['category-grid']}>
                          {/* 第一行 */}
                          <div className={styles['category-row']}>
                            {categories.slice(pageIndex * 16, pageIndex * 16 + 8).map((category) => (
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
                            {categories.slice(pageIndex * 16 + 8, (pageIndex + 1) * 16).map((category) => (
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
            {showSkeleton ? (
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
          </>
        );
      case 'cart':
        return (
          <div className={styles.cartContent}>
            {/* 购物车头部 */}
            <div className={styles.cartHeader}>
              <h2>购物车</h2>
              <Button
                color='danger'
                size='small'
                onClick={() => {
                  Toast.show('清空购物车');
                }}
              >
                清空购物车
              </Button>
            </div>

            {/* 购物车商品列表 */}
            <div className={styles.cartItems}>
              {/* 商品项1 */}
              <div className={styles.cartItem}>
                <div className={styles.cartItemImage}>
                  <Image
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150"
                    width={80}
                    height={80}
                    fit="cover"
                  />
                </div>
                <div className={styles.cartItemInfo}>
                  <div className={styles.cartItemName}>高腰A字牛仔连衣裙</div>
                  <div className={styles.cartItemPrice}>¥149.9</div>
                  <div className={styles.cartItemAttr}>颜色: 深蓝 | 尺码: M</div>
                  <div className={styles.cartItemSubtotal}>¥299.80</div>
                </div>
                <div className={styles.cartItemActions}>
                  <div className={styles.quantityControl}>
                    <Button
                      size='mini'
                      color='primary'
                      onClick={() => {
                        Toast.show('减少数量');
                      }}
                    >
                      -
                    </Button>
                    <span className={styles.quantity}>2</span>
                    <Button
                      size='mini'
                      color='primary'
                      onClick={() => {
                        Toast.show('增加数量');
                      }}
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    color='danger'
                    size='small'
                    onClick={() => {
                      Toast.show('删除商品');
                    }}
                  >
                    删除
                  </Button>
                </div>
              </div>

              {/* 商品项2 */}
              <div className={styles.cartItem}>
                <div className={styles.cartItemImage}>
                  <Image
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150"
                    width={80}
                    height={80}
                    fit="cover"
                  />
                </div>
                <div className={styles.cartItemInfo}>
                  <div className={styles.cartItemName}>高腰A字牛仔连衣裙</div>
                  <div className={styles.cartItemPrice}>¥149.9</div>
                  <div className={styles.cartItemAttr}>颜色: 深蓝 | 尺码: L</div>
                  <div className={styles.cartItemSubtotal}>¥299.80</div>
                </div>
                <div className={styles.cartItemActions}>
                  <div className={styles.quantityControl}>
                    <Button
                      size='mini'
                      color='primary'
                      onClick={() => {
                        Toast.show('减少数量');
                      }}
                    >
                      -
                    </Button>
                    <span className={styles.quantity}>2</span>
                    <Button
                      size='mini'
                      color='primary'
                      onClick={() => {
                        Toast.show('增加数量');
                      }}
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    color='danger'
                    size='small'
                    onClick={() => {
                      Toast.show('删除商品');
                    }}
                  >
                    删除
                  </Button>
                </div>
              </div>
            </div>

            {/* 购物车底部 */}
            <div className={styles.cartFooter}>
              <div className={styles.cartSummary}>
                <div className={styles.cartTotalItems}>共4件商品</div>
                <div className={styles.cartTotalPrice}>总计: ¥599.60</div>
              </div>
              <Button
                color='primary'
                size='large'
                block
                onClick={() => {
                  Toast.show('去结算');
                }}
              >
                去结算
              </Button>
            </div>
          </div>
        );
      case 'mine':
        return (
          <div className={styles.mineContent}>
            {/* 用户信息卡片 */}
            <Card className={styles.userCard}>
              <div className={styles.userInfo}>
                <Avatar
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
                  className={styles.avatar}
                />
                <div className={styles.userDetails}>
                  <div className={styles.userName}>张三</div>
                  <div className={styles.userPhone}>138****8888</div>
                  <div className={styles.userLevel}>
                    <Tag color='primary'>VIP会员</Tag>
                    <span className={styles.points}>积分: 2580</span>
                  </div>
                </div>
                <Button
                  size='small'
                  className={styles.editBtn}
                  onClick={() => {
                    Toast.show('编辑个人信息');
                  }}
                >
                  编辑
                </Button>
              </div>
            </Card>

            {/* 订单统计 */}
            <Card className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span className={styles.orderTitle}>我的订单</span>
                <div className={styles.orderMore}>
                  <span>查看全部</span>
                  <RightOutline />
                </div>
              </div>
              <div className={styles.orderStats}>
                {[
                  { title: '我的订单', icon: <UnorderedListOutline />, badge: 6 },
                  { title: '待付款', icon: <PayCircleOutline />, badge: 2 },
                  { title: '待发货', icon: <TruckOutline />, badge: 1 },
                  { title: '待收货', icon: <GiftOutline />, badge: 3 }
                ].map((item, index) => (
                  <div key={index} className={styles.orderItem}>
                    <div className={styles.orderIcon}>
                      {item.icon}
                      {item.badge > 0 && (
                        <span className={styles.badge}>{item.badge}</span>
                      )}
                    </div>
                    <span className={styles.orderText}>{item.title}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* 服务功能 */}
            <Card className={styles.serviceCard}>
              <div className={styles.serviceHeader}>
                <span className={styles.serviceTitle}>服务功能</span>
              </div>
              <div className={styles.serviceGrid}>
                {[
                  { title: '收货地址', icon: <LocationOutline /> },
                  { title: '我的收藏', icon: <HeartOutline /> },
                  { title: '客服中心', icon: <SearchOutline /> },
                  { title: '意见反馈', icon: <MessageOutline /> }
                ].map((item, index) => (
                  <div key={index} className={styles.serviceItem}>
                    <div className={styles.serviceIcon}>{item.icon}</div>
                    <span className={styles.serviceText}>{item.title}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* 设置选项 */}
            <Card className={styles.settingCard}>
              <List>
                {[
                  { title: '账户设置', icon: <SetOutline /> },
                  { title: '隐私设置', icon: <SetOutline /> }
                ].map((item, index) => (
                  <List.Item
                    key={index}
                    prefix={item.icon}
                    onClick={() => Toast.show(`跳转到${item.title}`)}
                    arrow={<RightOutline />}
                  >
                    {item.title}
                  </List.Item>
                ))}
              </List>
            </Card>

            {/* 退出登录 */}
            <div className={styles.logoutContainer}>
              <Button
                block
                color='danger'
                className={styles.logoutBtn}
                onClick={() => {
                  Toast.show('退出登录');
                }}
              >
                退出登录
              </Button>
            </div>
          </div>
        );
      default:
        return null;
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
    <Card className={styles['product-card']} onClick={() => {
      navigate(`/shoppdetail?id=${product._id}`)
    }}>
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

      {/* 渲染不同标签页的内容 */}
      {renderTabContent()}

      {/* 底部标签栏 */}
      <TabBar
        className={styles['tab-bar']}
        activeKey={activeBottomTab}
        onChange={handleBottomTabClick}
      >
        <TabBar.Item
          key="home"
          icon={<AppOutline />}
          title="首页"
        />
        <TabBar.Item
          key="categories"
          icon={<UnorderedListOutline />}
          title="分类"
        />
        <TabBar.Item
          key="cart"
          icon={<GiftOutline />}
          title="购物车"
        />
        <TabBar.Item
          key="mine"
          icon={<UserOutline />}
          title="我的"
        />
      </TabBar>
    </div>
  );
}